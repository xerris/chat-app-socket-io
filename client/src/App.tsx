import React, { useState, useEffect, useContext } from "react";
import "./css/App.css";
import "./utilities/theme.css";
import { AppContext } from "./components/AppContext";
import Routes from "./Routes";
import { ThemeProvider, createTheme } from "@material-ui/core/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#527a00"
    }
  }
});

function App() {
  const { connectSocket } = useContext(AppContext);

  useEffect(() => {
    // Connect to socket on refresh
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      connectSocket(undefined, sessionId);
    }
  }, []);

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Routes />
      </ThemeProvider>
    </div>
  );
}

export default App;
