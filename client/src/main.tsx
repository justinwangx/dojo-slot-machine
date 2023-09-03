import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import Roulette from "./Roulette.tsx";
import "./index.css";
import { setup } from "./dojo/setup";
import { DojoProvider } from "./DojoContext";
import Leaderboard from "./components/Leaderboard.tsx";

function Dapp() {
  const [page, setPage] = useState("Leaderboard");
  if (page == "Roulette") {
    return <Roulette setComponent={setPage} />;
  } else if (page == "Leaderboard") {
    return <Leaderboard setComponent={setPage} />;
  } else {
    return <App setComponent={setPage} />;
  }
}

async function init() {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("React root not found");
  const root = ReactDOM.createRoot(rootElement as HTMLElement);

  const setupResult = await setup();
  root.render(
    <React.StrictMode>
      <DojoProvider value={setupResult}>
        <Dapp />
      </DojoProvider>
    </React.StrictMode>
  );
}

init();
