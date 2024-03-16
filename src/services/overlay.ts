import { atom } from "jotai";
import { bsPlusOverlayAtom } from "./bs_plus_overlay";
import { loggerAtom } from "./logger";
import { Interaction, overlayStateAtom } from "./overlay_state";
import { getReconnectingWebSocket } from "./get_reconnecting_web_socket";

export const overlayAtom = atom(
  (get) => get(overlayStateAtom),
  async (get, set, value: Interaction) => {
    const aborter = get(aliveWebSocketAtom);
    if (aborter === undefined && value === "initialize") {
      set(
        aliveWebSocketAtom,
        getReconnectingWebSocket({
          url: "ws://localhost:2947/socket",
          onOpen: () => {
            set(loggerAtom, { level: "info", type: "socket_open" });
          },
          onMessage: (data) => {
            set(bsPlusOverlayAtom, data);
          },
          onClose: (event) => {
            set(loggerAtom, { level: "info", type: "socket_close", data: event });
            set(overlayStateAtom, { readyState: WebSocket.CLOSED });
          },
        }),
      );
    } else if (value === "cleanUp") {
      aborter?.abort();
      set(aliveWebSocketAtom, undefined);
    }
  },
);
overlayAtom.onMount = (set) => {
  set("initialize");
  return () => set("cleanUp");
};

const aliveWebSocketAtom = atom<AbortController | undefined>(undefined);
