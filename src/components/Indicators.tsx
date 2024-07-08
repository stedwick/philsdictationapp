import { MicrophoneIcon } from "@heroicons/react/24/solid";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { AnyMachineSnapshot } from "xstate";
import { taterMachineContext } from "../xstate/tater_machine_context";

const listeningSelector = (state: AnyMachineSnapshot) =>
  state.context.micState != "off";

export default function Indicators() {
  const isListening = taterMachineContext.useSelector(listeningSelector);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const onlineInterval = setInterval(
      () => setIsOnline(navigator.onLine),
      5000
    );
    return () => clearInterval(onlineInterval);
  }, [setIsOnline]);

  return (
    <>
      {!isListening && (
        <div className="tooltip" data-tip="Mic off">
          <span className="badge badge-outline badge-neutral">
            <MicrophoneIcon className="h-4 w-4"></MicrophoneIcon>
          </span>
        </div>
      )}
      {isListening && (
        <div className="tooltip" data-tip="Mic listening">
          <span className="badge badge-outline badge-success">
            <MicrophoneIcon className="h-4 w-4"></MicrophoneIcon>
          </span>
        </div>
      )}
      {!isOnline && (
        <div className="tooltip" data-tip="Offline">
          <span className="badge badge-outline badge-neutral">
            <WifiOff className="h-4 w-4" />
          </span>
        </div>
      )}
      {isOnline && (
        <div className="tooltip" data-tip="Online">
          <span className="badge badge-outline badge-primary">
            <Wifi className="h-4 w-4" />
          </span>
        </div>
      )}
    </>
  );
}
