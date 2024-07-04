import { useAtom } from "jotai";
import { useLocation } from "react-use";
import { DisconnectionWarning } from "./components/disconnection_warning";
import { uiTestOverlayAtom } from "./features/demo/atoms";
import { overlayAtom } from "./features/overlay/atoms/overlay";
import { ConnectedOverlay } from "./features/overlay/containers/connected_overlay";

export function App() {
  const { pathname } = useLocation();
  const [overlay, updateOverlay] = useAtom(
    pathname === "/test/ui" ? uiTestOverlayAtom : overlayAtom,
  );

  return (
    <div
      className="h-[100vh]"
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      <main
        className="w-full h-[20vw] text-white p-[1vw] text-[20vw]"
        onClick={() => updateOverlay("click")}
      >
        {overlay.readyState === WebSocket.OPEN
          ? <ConnectedOverlay state={overlay} />
          : <DisconnectionWarning />}
      </main>
    </div>
  );
}
