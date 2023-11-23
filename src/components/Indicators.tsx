import { MicrophoneIcon } from "@heroicons/react/24/solid";
import { NetworkState } from "@uidotdev/usehooks";
import { WifiOff, Wifi } from "lucide-react";

export default function Indicators(props: {
  listening: boolean;
  network: NetworkState;
}) {
  const { listening, network } = props;
  return (
    <>
      {!listening && (
        <div className="tooltip" data-tip="Mic off">
          <span className="badge badge-outline badge-neutral">
            <MicrophoneIcon className="h-4 w-4"></MicrophoneIcon>
          </span>
        </div>
      )}
      {listening && (
        <div className="tooltip" data-tip="Mic listening">
          <span className="badge badge-outline badge-success">
            <MicrophoneIcon className="h-4 w-4"></MicrophoneIcon>
          </span>
        </div>
      )}
      {!network.online && (
        <div className="tooltip" data-tip="Offline">
          <span className="badge badge-outline badge-neutral">
            <WifiOff className="h-4 w-4" />
          </span>
        </div>
      )}
      {network.online && (
        <div className="tooltip" data-tip="Online">
          <span className="badge badge-outline badge-primary">
            <Wifi className="h-4 w-4" />
          </span>
        </div>
      )}
    </>
  );
}
