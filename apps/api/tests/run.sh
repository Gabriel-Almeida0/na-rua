#!/usr/bin/env bash
# =============================================================================
# Runner da suíte pgTAP do Na Rua.
#
# Roda todos os .sql deste diretório dentro do container do Postgres e sai com
# código diferente de zero se qualquer teste falhar.
#
# Prefere pg_prove quando ele existe no container. A imagem oficial postgres:17
# não traz pg_prove (ele vem no pacote Perl TAP::Parser::SourceHandler::pgTAP,
# que o infra/Dockerfile.postgres não instala), então o caminho normal é o
# fallback: psql cuspindo TAP e este script procurando linhas "not ok".
#
# Um "not ok ... # TODO" NÃO derruba a suíte: é falha anunciada, descrevendo
# comportamento que o schema ainda não entrega.
#
# Variáveis de ambiente:
#   NA_RUA_DB_CONTAINER   nome do container       (padrão: na-rua-db)
#   NA_RUA_DB_SUPERUSER   papel dono/superusuário (padrão: narua)
#   NA_RUA_DB_NAME        banco                   (padrão: narua)
#
# Uso: apps/api/tests/run.sh          — roda tudo
#      apps/api/tests/run.sh 02       — roda só os arquivos que casam com "02"
# =============================================================================
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER="${NA_RUA_DB_CONTAINER:-na-rua-db}"
DB_USER="${NA_RUA_DB_SUPERUSER:-narua}"
DB_NAME="${NA_RUA_DB_NAME:-narua}"
FILTRO="${1:-}"

vermelho=''; verde=''; amarelo=''; normal=''
if [ -t 1 ]; then
  vermelho=$'\033[31m'; verde=$'\033[32m'; amarelo=$'\033[33m'; normal=$'\033[0m'
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "${vermelho}docker não encontrado no PATH.${normal}" >&2
  exit 127
fi

if [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null)" != "true" ]; then
  echo "${vermelho}container '$CONTAINER' não está rodando.${normal}" >&2
  echo "  suba com: docker compose -f infra/docker-compose.yml up -d" >&2
  exit 1
fi

# A extensão precisa estar instalada; sem ela nada aqui roda.
if ! docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -X -t -A \
       -c "select 1 from pg_extension where extname = 'pgtap'" 2>/dev/null | grep -q '^1$'; then
  echo "${vermelho}extensão pgtap não está instalada em $DB_NAME.${normal}" >&2
  echo "  rode: create extension if not exists pgtap;" >&2
  exit 1
fi

# Lista de arquivos, em ordem.
arquivos=()
while IFS= read -r f; do
  [ -n "$FILTRO" ] && case "$(basename "$f")" in *"$FILTRO"*) ;; *) continue ;; esac
  arquivos+=("$f")
done < <(find "$DIR" -maxdepth 1 -name '*.sql' -type f | sort)

if [ "${#arquivos[@]}" -eq 0 ]; then
  echo "${vermelho}nenhum arquivo .sql encontrado em $DIR${normal}" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Caminho 1 · pg_prove, se o container tiver.
# ---------------------------------------------------------------------------
if docker exec "$CONTAINER" sh -c 'command -v pg_prove' >/dev/null 2>&1; then
  echo "${amarelo}pg_prove encontrado no container — usando ele.${normal}"
  destino="/tmp/na-rua-pgtap-$$"
  docker exec "$CONTAINER" mkdir -p "$destino" || exit 1
  for f in "${arquivos[@]}"; do
    docker cp "$f" "$CONTAINER:$destino/$(basename "$f")" || exit 1
  done
  docker exec -e PGUSER="$DB_USER" -e PGDATABASE="$DB_NAME" "$CONTAINER" \
    pg_prove --verbose "$destino"/*.sql
  status=$?
  docker exec "$CONTAINER" rm -rf "$destino" >/dev/null 2>&1
  exit $status
fi

# ---------------------------------------------------------------------------
# Caminho 2 · psql cuspindo TAP puro (-t -A) e parsing aqui.
# ---------------------------------------------------------------------------
total=0
passou=0
falhou=0
pendente=0
arquivos_ruins=()

for f in "${arquivos[@]}"; do
  nome="$(basename "$f")"
  echo
  echo "── $nome ───────────────────────────────────────────────"

  saida="$(docker exec -i "$CONTAINER" \
            psql -U "$DB_USER" -d "$DB_NAME" \
                 -X -q -t -A --no-psqlrc -v ON_ERROR_STOP=1 -f - < "$f" 2>&1)"
  psql_status=$?

  echo "$saida"

  n_ok=$(printf '%s\n' "$saida"     | grep -c '^ok ')
  n_todo=$(printf '%s\n' "$saida"   | grep -c '^not ok .*# TODO')
  n_notok=$(printf '%s\n' "$saida"  | grep -c '^not ok ')
  n_reais=$(( n_notok - n_todo ))

  total=$(( total + n_ok + n_notok ))
  passou=$(( passou + n_ok ))
  pendente=$(( pendente + n_todo ))
  falhou=$(( falhou + n_reais ))

  ruim=0
  [ "$psql_status" -ne 0 ] && ruim=1
  [ "$n_reais" -gt 0 ] && ruim=1
  # Plano que não bate com o que rodou também é falha.
  printf '%s\n' "$saida" | grep -q '^# Looks like you planned' && ruim=1
  # Nenhuma asserção rodou: arquivo quebrado.
  [ $(( n_ok + n_notok )) -eq 0 ] && ruim=1

  if [ "$ruim" -eq 1 ]; then
    arquivos_ruins+=("$nome")
    echo "${vermelho}✗ $nome${normal}"
  else
    echo "${verde}✓ $nome — $n_ok teste(s)${normal}${amarelo}$( [ "$n_todo" -gt 0 ] && echo ", $n_todo TODO" )${normal}"
  fi
done

echo
echo "════════════════════════════════════════════════════════"
echo "  arquivos:  ${#arquivos[@]}"
echo "  testes:    $total"
echo "  passaram:  $passou"
echo "  falharam:  $falhou"
echo "  TODO:      $pendente (falha anunciada, não derruba a suíte)"
echo "════════════════════════════════════════════════════════"

if [ "${#arquivos_ruins[@]}" -gt 0 ]; then
  echo "${vermelho}SUÍTE VERMELHA em: ${arquivos_ruins[*]}${normal}"
  exit 1
fi

echo "${verde}SUÍTE VERDE${normal}"
exit 0
