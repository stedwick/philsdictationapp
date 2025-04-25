import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

export default function TaterFatal() {
  return (
    <div
      role="alert"
      className="alert alert-error mb-4 flex justify-center max-w-lg mx-auto"
    >
      <ExclamationCircleIcon className="h-6 w-6 shrink-0"></ExclamationCircleIcon>
      <span className="font-bold">
        Your web browser doesn't support speech recognition.
      </span>
    </div>
  );
}
