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

export const Buttons: React.FC<{
  dictationState: string;
  setDictationState: Function;
}> = ({ dictationState, setDictationState }) => {
  const pauseEnabled = dictationState == "on" ? "" : "btn-disabled";
  const stopEnabled =
    dictationState == "on" || dictationState == "paused" ? "" : "btn-disabled";
  const resumeEnabled = dictationState == "paused" ? "" : "hidden";
  return (
    <div className="flex flex-wrap justify-between gap-2 mb-2">
      <div className="flex flex-wrap gap-2 mb-4">
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
            <BellSnoozeIcon className="h-6 w-6"></BellSnoozeIcon>Say "Wake up"
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
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-outline btn-secondary">
          <ClipboardDocumentListIcon className="h-6 w-6"></ClipboardDocumentListIcon>
          Paste to app
        </button>
        <button className="btn btn-outline btn-primary">
          <ClipboardIcon className="h-6 w-6"></ClipboardIcon>Copy
        </button>
        <button className="btn btn-outline">
          <ScissorsIcon className="h-6 w-6"></ScissorsIcon>Cut
        </button>
      </div>
    </div>
  );
};
