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

export async function pasteToApp() {
  const response: boolean = await invoke("paste_to_app");
  if (response) {
    toast.success("Pasted");
  } else {
    toast.error("Couldn't paste");
  }
}

export function copy(textareaRef: React.RefObject<HTMLTextAreaElement>) {
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

export function cut(textareaRef: React.RefObject<HTMLTextAreaElement>) {
  copy(textareaRef);
  textareaRef.current!.value = "";
}
