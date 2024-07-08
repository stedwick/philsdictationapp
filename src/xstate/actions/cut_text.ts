import toast from "react-hot-toast";

export default function cutText(textareaEl: HTMLTextAreaElement) {
  navigator.clipboard.writeText(textareaEl.value).then(
    () => {
      toast.success("Copied to clipboard");
      textareaEl.value = "";
    },
    () => {
      toast.error("Couldn't access clipboard");
    }
  );
}
