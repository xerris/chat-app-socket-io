import ReactDOM from "react-dom";
import "./css/index.css";
import App from "./App";
import { SocketProvider } from "./components/SocketContext";

ReactDOM.render(
  <SocketProvider>
    <App />
  </SocketProvider>,
  document.getElementById("root")
);
