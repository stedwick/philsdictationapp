import toast from "react-hot-toast";
import { invoke } from "@tauri-apps/api/tauri";

// async function pasteToAppWithText(
//   textareaRef: React.RefObject<HTMLTextAreaElement>
// ) {
//   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//   const text = textareaRef.current?.value || "";
//   const response: string = await invoke("pasteToAppWithText", { text });
//   toast.success(response);
// }

export async function invokePasteToApp() {
  const response: boolean = await invoke("paste_to_app");
  if (response) {
    toast.success("Pasted");
  } else {
    toast.error("Couldn't paste");
  }
}

type CopyOpts = {
  toast?: boolean;
  success?: Function | null;
};
export function execCopy(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  setDictationState: React.Dispatch<React.SetStateAction<string>>,
  userOpts: CopyOpts = {}
) {
  const opts = { toast: true, success: null, ...userOpts };
  const text = textareaRef.current?.value;
  if (text) {
    setDictationState("paused");
    navigator.clipboard.writeText(text).then(
      () => {
        /* clipboard successfully set */
        if (opts.toast) toast.success("Copied");
        if (opts.success) opts.success();
      },
      () => {
        /* clipboard write failed */
        toast.error("Couldn't access clipboard");
      }
    );
  } else {
    // toast("Nothing to copy", { icon: "✏️" });
  }
}

export function execCut(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  setDictationState: React.Dispatch<React.SetStateAction<string>>
) {
  execCopy(textareaRef, setDictationState, {
    success: () => {
      textareaRef.current!.value = "";
    },
  });
}

export function execPasteToApp(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  setDictationState: React.Dispatch<React.SetStateAction<string>>
) {
  execCopy(textareaRef, setDictationState, {
    toast: false,
    success: () => {
      invokePasteToApp();
      textareaRef.current!.value = "";
    },
  });
}
