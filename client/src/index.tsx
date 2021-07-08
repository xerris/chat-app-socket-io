import ReactDOM from "react-dom";
import "./css/index.css";
import App from "./App";
import { AppProvider } from "./components/AppContext";

ReactDOM.render(
  <AppProvider>
    <App />
  </AppProvider>,
  document.getElementById("root")
);
