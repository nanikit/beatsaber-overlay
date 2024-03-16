import { useAtom } from "jotai";
import { useLocation, useSearchParam } from "react-use";
import { DisconnectionWarning } from "./components/disconnection_warning";
import { ConnectedOverlay } from "./containers/connected_overlay";
import { uiTestOverlayAtom } from "./features/demo/atoms";
import { overlayAtom } from "./features/overlay/atoms/overlay";

export function App() {
  const { pathname } = useLocation();
  const [overlay, updateOverlay] = useAtom(
    pathname === "/test/ui" ? uiTestOverlayAtom : overlayAtom,
  );
  const layout = useSearchParam("layout");
  const isRight = layout !== "left";

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
          ? <ConnectedOverlay state={overlay} isRight={isRight} />
          : <DisconnectionWarning isRight={isRight} />}
      </main>
    </div>
  );
}
