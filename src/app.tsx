import { useAtomValue, useSetAtom } from "jotai";
import { uiTestOverlayClickAtom } from "./atoms/demo";
import { overlayAtom } from "./atoms/overlay";
import { ConnectedOverlay } from "./components/connected_overlay";
import { DisconnectionWarning } from "./components/disconnection_warning";

export function App() {
  const overlay = useAtomValue(overlayAtom);
  const updateOverlay = useSetAtom(uiTestOverlayClickAtom);

  return (
    <div
      className="h-screen"
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      <main
        className="w-full h-[20vw] text-white p-[1vw] text-[20vw]"
        onClick={updateOverlay}
      >
        {overlay.readyState === WebSocket.OPEN
          ? <ConnectedOverlay state={overlay} />
          : <DisconnectionWarning />}
      </main>
    </div>
  );
}
