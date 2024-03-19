import { atom } from "jotai";
import { loggerAtom } from "../../atoms/logger";
import { Mount, mount, onMount, unmount } from "../../modules/atom_mount_hook";
import { getReconnectingWebSocket } from "../../modules/get_reconnecting_web_socket";
import { endpointAtom } from "../overlay/atoms/endpoint";
import { convertStatus, mergeEvent } from "./helpers";
import { HttpSiraStatus, HttpSiraStatusEvent } from "./types";

const overlayStateAtom = atom<HttpSiraStatus | null>(null);
const aliveWebSocketAtom = atom<AbortController | null>(null);

export const siraOverlayAtom = atom(
  (get) => {
    const state = get(overlayStateAtom);
    if (state === null) {
      return { readyState: WebSocket.CLOSED };
    }
    return convertStatus(state);
  },
  async (get, set, value: Mount) => {
    const aborter = get(aliveWebSocketAtom);
    aborter?.abort();

    if (value === mount) {
      const newAborter = new AbortController();
      getReconnectingWebSocket({
        url: "ws://localhost:6557/socket",
        onOpen: () => {
          set(endpointAtom, "sirahttpstatus");
          set(loggerAtom, { level: "info", type: "socket_open" });
        },
        onMessage: (data) => {
          const message = JSON.parse(data) as HttpSiraStatusEvent;
          const previous = get(overlayStateAtom);
          set(overlayStateAtom, mergeEvent((previous ?? message) as HttpSiraStatus, message));
        },
        onClose: () => {
          set(loggerAtom, { level: "info", type: "socket_close" });
          set(overlayStateAtom, null);
        },
        aborter: newAborter,
      });
      set(aliveWebSocketAtom, newAborter);
    } else if (value === unmount) {
      set(aliveWebSocketAtom, null);
    }
  },
);
siraOverlayAtom.onMount = onMount;
