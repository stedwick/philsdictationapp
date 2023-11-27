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

type CopyOpts = {
  toast?: boolean;
  success?: Function | null;
};
export function copy(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  userOpts: CopyOpts = {}
) {
  const opts = { toast: true, success: null, ...userOpts };
  const text = textareaRef.current?.value;
  if (text) {
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
