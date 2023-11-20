import { useState } from "react";
// import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { MicrophoneIcon, PauseIcon, StopIcon } from "@heroicons/react/24/solid";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="container mx-auto px-4 py-2">
      <h1 className="text-xl text-center">Welcome to Phil's Dictation App!</h1>

      <textarea
        placeholder="Click 🎙️ Start Dictating button below..."
        className="textarea textarea-bordered textarea-lg w-full my-4"
      ></textarea>

      <button className="btn btn-outline btn-error">
        <MicrophoneIcon className="h-6 w-6"></MicrophoneIcon>Start Dictating
      </button>
      <button className="btn btn-error relative">
        <MicrophoneIcon className="h-6 w-6 animate-ping absolute left-4"></MicrophoneIcon>
        <MicrophoneIcon className="h-6 w-6"></MicrophoneIcon>
        Dictating...
      </button>
      <button className="btn btn-outline btn-warning">
        <PauseIcon className="h-6 w-6"></PauseIcon>Pause
      </button>
      <button className="btn btn-outline btn-info">
        <StopIcon className="h-6 w-6"></StopIcon>Stop
      </button>
    </div>
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
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </>
  );
}

export default App;
