import { atom } from "jotai";
import { aliveWebSocketAtom, getAliveWebSocket } from "./alive_websocket";
import { bsPlusOverlayAtom } from "./bs_plus_overlay";
import { loggerAtom } from "./logger";
import { Interaction, OverlayState, overlayStateAtom } from "./overlay_state";

export const overlayAtom = atom<OverlayState, Interaction>(
  (get) => get(overlayStateAtom),
  (get, set, value: Interaction) => {
    const aborter = get(aliveWebSocketAtom);
    if (aborter === undefined && value === "initialize") {
      set(
        aliveWebSocketAtom,
        getAliveWebSocket({
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

    return get(overlayStateAtom);
  },
);
