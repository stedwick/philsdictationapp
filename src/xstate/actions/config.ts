import { TaterContext, initialTaterContext } from "../types/tater_context";

function saveConfig({ context: { config } }: { context: TaterContext }) {
  localStorage.setItem("config", JSON.stringify(config));
}

function loadConfig() {
  const loadedConfig = JSON.parse(localStorage.getItem("config") || "{}") as TaterContext["config"];
  return { ...initialTaterContext.config, ...loadedConfig };
}

export { saveConfig, loadConfig };
