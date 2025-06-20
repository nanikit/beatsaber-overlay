import { useAtom } from "jotai";
import { appAtom } from "./atoms/view_models";
import { ConnectedOverlay } from "./components/connected_overlay";
import { DisconnectionWarning } from "./components/disconnection_warning";

export function App() {
  const [{ isConnected }, updateOverlay] = useAtom(appAtom);

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
        {isConnected ? <ConnectedOverlay /> : <DisconnectionWarning />}
      </main>
    </div>
  );
}
