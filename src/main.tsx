import React from "react";
import ReactDOM from "react-dom/client";
import "regenerator-runtime/runtime";
import App from "./App";
import "./styles.css";
import { taterMachineContext } from "./xstate/tater_machine_context";
import RevAiDemo from "./revai";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RevAiDemo />
    {/* <taterMachineContext.Provider> */}
    {/*   <App /> */}
    {/* </taterMachineContext.Provider> */}
  </React.StrictMode>
);
