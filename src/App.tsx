import { useEffect, useState, useRef } from "react";
// import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { Buttons } from "./components/Buttons";
import { Toaster } from "react-hot-toast";

function App() {
  const [dictationState, setDictationState] = useState<"on" | "off" | "paused">(
    "off"
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    navigator.clipboard.writeText("newClip").then(
      () => {
        /* clipboard successfully set */
      },
      () => {
        /* clipboard write failed */
      }
    );
  }, []);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <>
      <Toaster />
      <div
        className="container mx-auto px-4 py-4 flex flex-col"
        style={{ height: "100dvh" }}
      >
        <h1 className="text-xl text-center">
          Welcome to Phil's Dictation App!
        </h1>

        <textarea
          placeholder="Click 🎙️ Start Dictating button below..."
          className="textarea textarea-primary textarea-lg w-full my-4 flex-grow"
          ref={textareaRef}
        ></textarea>

        {
          <Buttons
            dictationState={dictationState}
            setDictationState={setDictationState}
            textareaRef={textareaRef}
          />
        }
      </div>
    </>
  );
}

function none() {
  return (
    <>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          // greet();
        }}
      >
        <input
          id="greet-input"
          // onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      {/* <p>{greetMsg}</p> */}
    </>
  );
}

export default App;
