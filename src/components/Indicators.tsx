import { MicrophoneIcon } from "@heroicons/react/24/solid";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { AnyMachineSnapshot } from "xstate";
import { taterMachineContext } from "../xstate/tater_machine_context";

const listeningSelector = (state: AnyMachineSnapshot) =>
  state.context.micState != "off";
const autoMicSelector = (state: AnyMachineSnapshot) =>
  state.context.config.autoMic;

export default function Indicators() {
  const isListening = taterMachineContext.useSelector(listeningSelector);
  const isAutoMic = taterMachineContext.useSelector(autoMicSelector);
  const taterActor = taterMachineContext.useActorRef();
  const [isOnline, setIsOnline] = useState(true);
  const setAutoMic = (event: React.ChangeEvent<HTMLInputElement>) => taterActor.send({
    type: "setConfig", key: "autoMic", value: event.target.checked
  });

  useEffect(() => {
    const onlineInterval = setInterval(
      () => setIsOnline(navigator.onLine),
      5000
    );
    return () => clearInterval(onlineInterval);
  }, [setIsOnline]);

  return (
    <div className="w-full flex justify-between space-x-2 pb-3">
      <div className="form-control">
        <label className="label cursor-pointer pt-0 pl-0">
          <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={isAutoMic && "checked"} onChange={setAutoMic} />
          <span className="label-text ml-2">Auto-listen (Azure)</span>
        </label>
      </div>

      <div className="flex space-x-2">
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
      </div>
    </div>
  );
}
