import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

export default function MicErrors(props: {
  isMicrophoneAvailable: boolean;
  browserSupportsSpeechRecognition: boolean;
}) {
  const { isMicrophoneAvailable, browserSupportsSpeechRecognition } = props;
  return (
    <>
      {!browserSupportsSpeechRecognition && (
        <div
          role="alert"
          className="alert alert-error mb-4 flex justify-center max-w-lg mx-auto"
        >
          <ExclamationCircleIcon className="h-6 w-6 shrink-0"></ExclamationCircleIcon>
          <span className="font-bold">
            Browser doesn't support speech recognition.
          </span>
        </div>
      )}
      {!isMicrophoneAvailable && (
        <div
          role="alert"
          className="alert alert-warning mb-4 flex justify-center max-w-lg mx-auto"
        >
          <ExclamationTriangleIcon className="h-6 w-6 shrink-0"></ExclamationTriangleIcon>
          <span className="font-bold">Couldn't access microphone.</span>
        </div>
      )}
    </>
  );
}
