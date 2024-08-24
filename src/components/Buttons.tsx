import {
  BellSnoozeIcon,
  MicrophoneIcon,
  ScissorsIcon,
} from "@heroicons/react/24/solid";
import { YoutubeIcon } from "lucide-react";
import { AnyMachineSnapshot } from "xstate";
import { taterMachineContext } from "../xstate/tater_machine_context";

const micStateSelector = (state: AnyMachineSnapshot) => state.context.micState;
const textareaValueSelector = (state: AnyMachineSnapshot) =>
  state.context.textareaCurrentValues.value;

export const Buttons = () => {
  const taterRef = taterMachineContext.useActorRef();
  const micState = taterMachineContext.useSelector(micStateSelector);

  const textareaValue = taterMachineContext.useSelector(textareaValueSelector);
  const cutEnabled = textareaValue ? "" : "btn-disabled";

  return (
    <div className="flex flex-wrap justify-center lg:justify-between flex-col lg:flex-row gap-x-12 mb-2">
      <div className="flex flex-wrap justify-center gap-2">
        <div className="group">
          {micState == "off" && (
            <button
              className="btn btn-outline btn-error"
              onClick={() => taterRef.send({ type: "turnOn" })}
            >
              <MicrophoneIcon className="h-6 w-6"></MicrophoneIcon>Start
              Dictating
            </button>
          )}
          {micState == "awake" && (
            <button
              className="btn btn-error relative"
              onClick={() => taterRef.send({ type: "turnOff" })}
            >
              <MicrophoneIcon className="h-6 w-6 animate-ping absolute left-4"></MicrophoneIcon>
              <MicrophoneIcon className="h-6 w-6"></MicrophoneIcon>
              <span>Dictating...</span>
              {/* <span className="hidden group-hover:inline">
                Say "turn off"...
              </span> */}
            </button>
          )}
          {micState == "asleep" && (
            <button
              className="btn btn-outline"
              onClick={() => taterRef.send({ type: "wake" })}
            >
              <BellSnoozeIcon className="h-6 w-6"></BellSnoozeIcon>Say "wake up"
            </button>
          )}
        </div>
        <button
          className={"btn btn-outline " + cutEnabled}
          onClick={() => taterRef.send({ type: "cut" })}
        >
          <ScissorsIcon className="h-6 w-6"></ScissorsIcon>Cut
        </button>
      </div>

      <div className="divider my-2 lg:hidden"></div>

      <div className="flex flex-wrap gap-2 justify-center">
        {/* import.meta.env.VITE_WEB */}
        <a
          href="https://youtu.be/47E8MYEPQrI"
          target="_blank"
        >
          <button className="btn">
            <YoutubeIcon className="h-6 w-6"></YoutubeIcon>
            1-minute tutorial
          </button>
          {/* <a */}
          {/*   href="https://www.microsoft.com/store/apps/9NTPHH45FFRN" */}
          {/*   target="_blank" */}
          {/* > */}
          {/* <button className="btn btn-outline btn-secondary"> */}
          {/*   <LayoutGridIcon className="h-6 w-6"></LayoutGridIcon> */}
          {/*   TODO: [Premium] with LemonSqueezy */}
          {/*   Premium */}
          {/* </button> */}
        </a>
      </div>
    </div>
  );
};
