/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

/**
 * Service worker.
 *
 * Serve o shell e os assets offline. NÃO cacheia a API: os dados vêm do
 * IndexedDB, e a fila de escrita é o outbox — cache de resposta de API aqui
 * só criaria uma terceira fonte de verdade.
 *
 * Serwist e não next-pwa: o next-pwa está morto desde 2022 e o
 * @ducanh2912/next-pwa manda migrar para cá no próprio README. Ver ADR-0013.
 */
const serwist = new Serwist({
  // exactOptionalPropertyTypes: o manifesto é injetado no build e pode não
  // existir em dev, então a chave não pode carregar undefined.
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [{ url: "/", matcher: ({ request }) => request.destination === "document" }],
  },
});

serwist.addEventListeners();
