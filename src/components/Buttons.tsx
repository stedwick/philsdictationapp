import {
  BellSnoozeIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon,
  MicrophoneIcon,
  PauseIcon,
  PlayIcon,
  ScissorsIcon,
  StopIcon,
} from "@heroicons/react/24/solid";
import { execCopy, execCut, execPasteToApp } from "../helpers/clipboard";

export const Buttons: React.FC<{
  dictationState: string;
  setDictationState: React.Dispatch<React.SetStateAction<any>>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}> = ({ dictationState, setDictationState, textareaRef }) => {
  const pauseEnabled = dictationState == "on" ? "" : "btn-disabled";
  const stopEnabled =
    dictationState == "on" || dictationState == "paused" ? "" : "btn-disabled";
  const resumeEnabled = dictationState == "paused" ? "" : "hidden";

  return (
    <div className="flex flex-wrap justify-center lg:justify-between flex-col lg:flex-row gap-x-12 mb-2">
      <div className="flex flex-wrap justify-center gap-2">
        {dictationState != "on" && !!resumeEnabled && (
          <button
            className="btn btn-outline btn-error"
            onClick={() => setDictationState("on")}
          >
            <MicrophoneIcon className="h-6 w-6"></MicrophoneIcon>Start Dictating
          </button>
        )}
        {dictationState == "on" && (
          <button
            className="btn btn-error relative"
            onClick={() => setDictationState("off")}
          >
            <MicrophoneIcon className="h-6 w-6 animate-ping absolute left-4"></MicrophoneIcon>
            <MicrophoneIcon className="h-6 w-6"></MicrophoneIcon>
            Dictating...
          </button>
        )}
        {!resumeEnabled && (
          <button
            className="btn btn-outline"
            onClick={() => setDictationState("on")}
          >
            <BellSnoozeIcon className="h-6 w-6"></BellSnoozeIcon>Say "wake up"
          </button>
        )}
        {!!resumeEnabled && (
          <button
            className={"btn btn-outline btn-warning " + pauseEnabled}
            onClick={() => setDictationState("paused")}
          >
            <PauseIcon className="h-6 w-6"></PauseIcon>Pause
          </button>
        )}
        {!resumeEnabled && (
          <button
            className={"btn btn-outline btn-success " + resumeEnabled}
            onClick={() => setDictationState("on")}
          >
            <PlayIcon className="h-6 w-6"></PlayIcon>Resume
          </button>
        )}
        <button
          className={"btn btn-outline btn-info " + stopEnabled}
          onClick={() => setDictationState("off")}
        >
          <StopIcon className="h-6 w-6"></StopIcon>Stop
        </button>
      </div>

      <div className="divider my-2 lg:hidden"></div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          className="btn btn-outline btn-secondary"
          onClick={() => {
            execPasteToApp(textareaRef, setDictationState);
          }}
        >
          <ClipboardDocumentListIcon className="h-6 w-6"></ClipboardDocumentListIcon>
          Paste to app
        </button>
        <button
          className="btn btn-outline btn-primary"
          onClick={() => execCopy(textareaRef, setDictationState)}
        >
          <ClipboardIcon className="h-6 w-6"></ClipboardIcon>Copy
        </button>
        <button
          className="btn btn-outline"
          onClick={() => execCut(textareaRef, setDictationState)}
        >
          <ScissorsIcon className="h-6 w-6"></ScissorsIcon>Cut
        </button>
      </div>
    </div>
  );
};
