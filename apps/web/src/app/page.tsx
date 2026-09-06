import { App } from "../componentes/App.tsx";

/**
 * O shell vem do servidor e aparece na hora; o miolo é client porque a fonte de
 * verdade da interface é o IndexedDB, que só existe no navegador.
 */
export default function Pagina() {
  return <App />;
}
