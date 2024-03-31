import { atom } from "jotai";
import { loggerAtom } from "../../atoms/logger";
import { Mount, mount, onMount, unmount } from "../../modules/atom_mount_hook";
import { getReconnectingWebSocket } from "../../modules/get_reconnecting_web_socket";
import { endpointAtom } from "../overlay/atoms/endpoint";
import { OverlayState } from "../overlay/types";
import { BsPlusMessageHandler } from "./helpers";
import { BsPlusMessage } from "./types";

const aliveWebSocketAtom = atom<AbortController | null>(null);
const overlayStateAtom = atom<OverlayState>({ readyState: WebSocket.CLOSED });

export const bsPlusOverlayAtom = atom(
  (get) => get(overlayStateAtom),
  (get, set, value: Mount) => {
    const aborter = get(aliveWebSocketAtom);
    aborter?.abort();

    if (value === mount) {
      const handler = new BsPlusMessageHandler((state) => set(overlayStateAtom, state));
      const newAborter = new AbortController();
      newAborter.signal.addEventListener("abort", handler.dispose);

      getReconnectingWebSocket({
        url: "ws://localhost:2947/socket",
        onOpen: () => {
          set(endpointAtom, "bsplus");
          set(loggerAtom, { level: "info", type: "socket_open" });
        },
        onMessage: (data) => {
          const message = JSON.parse(data) as BsPlusMessage;
          handler.process(message);
        },
        onClose: () => {
          set(loggerAtom, { level: "info", type: "socket_close" });
          set(endpointAtom, null);
        },
        aborter: newAborter,
      });
      set(aliveWebSocketAtom, newAborter);
    } else if (value === unmount) {
      set(aliveWebSocketAtom, null);
    }
  },
);
bsPlusOverlayAtom.onMount = onMount;
