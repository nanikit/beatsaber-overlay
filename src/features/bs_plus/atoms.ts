import { atom, Getter, Setter } from "jotai";
import { loggerAtom } from "../../atoms/logger";
import { OverlayState } from "../overlay/types";
import { BsPlusMessage } from "./types";
import { getReconnectingWebSocket } from "../../modules/get_reconnecting_web_socket";
import { endpointAtom } from "../overlay/atoms/endpoint";
import { Mount, mount, onMount, unmount } from "../../modules/atom_mount_hook";

const isNoFailAtom = atom(false);
const aliveWebSocketAtom = atom<AbortController | null>(null);
const overlayStateAtom = atom<OverlayState>({ readyState: WebSocket.CLOSED });

export const bsPlusOverlayAtom = atom(
  (get) => get(overlayStateAtom),
  (get, set, value: Mount) => {
    const aborter = get(aliveWebSocketAtom);
    aborter?.abort();

    if (value === mount) {
      const newAborter = new AbortController();
      getReconnectingWebSocket({
        url: "ws://localhost:2947/socket",
        onOpen: () => {
          set(endpointAtom, "bsplus");
          set(loggerAtom, { level: "info", type: "socket_open" });
        },
        onMessage: (data) => {
          const message = JSON.parse(data) as BsPlusMessage;
          const previous = get(overlayStateAtom);
          const current = processBsPlusMessage(previous, message, { get, set });
          set(overlayStateAtom, current);
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

function processBsPlusMessage(
  previous: OverlayState,
  message: BsPlusMessage,
  { get, set }: { get: Getter; set: Setter },
): OverlayState {
  if (message._type === "handshake") {
    return {
      ...previous,
      readyState: WebSocket.OPEN,
      user: { id: message.playerPlatformId, name: message.playerName },
      mapInfo: undefined,
      scoring: undefined,
      progress: undefined,
    };
  } else {
    switch (message._event) {
      case "gameState":
        if (message.gameStateChanged === "Menu") {
          return {
            ...previous,
            mapInfo: undefined,
            scoring: undefined,
            progress: undefined,
          };
        }
        return previous;
      case "mapInfo":
        const {
          level_id: id,
          characteristic,
          difficulty,
          coverRaw,
          name,
          sub_name,
          artist,
          mapper,
          duration,
          time,
          timeMultiplier,
        } = message.mapInfoChanged;

        set(loggerAtom, { level: "info", type: "map_changed", data: { id } });
        set(isNoFailAtom, false);

        return {
          ...previous,
          mapInfo: {
            hash: id.startsWith("custom_level_") ? id.split("_")[2]?.toLowerCase() : "",
            characteristic,
            difficulty,
            title: name,
            subtitle: sub_name,
            artist,
            mapper,
            coverUrl: coverRaw.startsWith("http") ? coverRaw : `data:image/png;base64,${coverRaw}`,
            duration: duration / 1000,
          },
          progress: {
            point: new Date(),
            resumeTime: time,
            timeMultiplier,
          },
        };
      case "score":
        const { accuracy, currentHealth, score } = message.scoreEvent;

        const isScoreChangedAfterFail = currentHealth === 0 && score !== previous.scoring?.score;
        const seemsNoFail = isScoreChangedAfterFail;
        const isNoFail = get(isNoFailAtom) || seemsNoFail && (set(isNoFailAtom, true), true);

        return {
          ...previous,
          scoring: {
            accuracy: isNoFail ? accuracy * 2 : accuracy,
            health: message.scoreEvent.currentHealth,
          },
        };
      case "resume":
        return {
          ...previous,
          progress: {
            point: new Date(),
            resumeTime: message.resumeTime,
            timeMultiplier: previous.progress?.timeMultiplier ?? 1,
          },
        };
      case "pause":
        return {
          ...previous,
          progress: {
            point: new Date(),
            pauseTime: message.pauseTime,
            timeMultiplier: previous.progress?.timeMultiplier ?? 1,
          },
        };
      default:
        return previous;
    }
  }
}
