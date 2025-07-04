import React from "react";
import ReactDOM from "react-dom/client";
import "regenerator-runtime/runtime";
import App from "./App";
import "./styles.css";
import { taterMachineContext } from "./xstate/tater_machine_context";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <taterMachineContext.Provider>
      <App />
    </taterMachineContext.Provider>
  </React.StrictMode>
);
