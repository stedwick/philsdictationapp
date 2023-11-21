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
import toast from "react-hot-toast";
import { invoke } from "@tauri-apps/api/tauri";

async function pasteToApp(textareaRef: React.RefObject<HTMLTextAreaElement>) {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  const text = textareaRef.current?.value;
  const response: string = await invoke("pasteToApp", { text });
  toast.success(response);
}

function copy(textareaRef: React.RefObject<HTMLTextAreaElement>) {
  const text = textareaRef.current?.value;
  if (text) {
    navigator.clipboard.writeText(text).then(
      () => {
        /* clipboard successfully set */
        toast.success("Copied");
      },
      () => {
        /* clipboard write failed */
        toast.error("Couldn't access clipboard");
      }
    );
  } else {
    toast("Nothing to copy", { icon: "✏️" });
  }
}

function cut(textareaRef: React.RefObject<HTMLTextAreaElement>) {
  copy(textareaRef);
  textareaRef.current!.value = "";
}

export const Buttons: React.FC<{
  dictationState: string;
  setDictationState: Function;
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
          onClick={() => pasteToApp(textareaRef)}
        >
          <ClipboardDocumentListIcon className="h-6 w-6"></ClipboardDocumentListIcon>
          Paste to app
        </button>
        <button
          className="btn btn-outline btn-primary"
          onClick={() => copy(textareaRef)}
        >
          <ClipboardIcon className="h-6 w-6"></ClipboardIcon>Copy
        </button>
        <button className="btn btn-outline" onClick={() => cut(textareaRef)}>
          <ScissorsIcon className="h-6 w-6"></ScissorsIcon>Cut
        </button>
      </div>
    </div>
  );
};
