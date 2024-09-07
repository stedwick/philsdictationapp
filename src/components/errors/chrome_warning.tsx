import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useLocalStorage } from "@uidotdev/usehooks";
import { isGoogleChromeOfficial } from "../../xstate/helpers/mobile";

function ChromeWarning() {
  const [showChromeWarning, setShowChromeWarning] = useLocalStorage(
    "showChromeWarning",
    !isGoogleChromeOfficial
  );

  if (!showChromeWarning) {
    return null;
  }

  return (
    <div role="alert" className="alert alert-warning mb-4 max-w-lg mx-auto">
      <ExclamationTriangleIcon className="h-6 w-6 shrink-0" />
      <span>
        FYI, TaterTalk only works in{" "}
        <a
          href="https://www.google.com/chrome/"
          className="link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Chrome
        </a>
      </span>
      <button
        onClick={() => setShowChromeWarning(false)}
        className="btn btn-sm"
      >
        <XMarkIcon className="h-5 w-5" /> Hide
      </button>
    </div>
  );
}

export default ChromeWarning;
