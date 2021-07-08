import React, { useState, useEffect, useContext } from "react";
import "./css/App.css";
import "./App.css";
import "./utilities/theme.css";
import RoomList from "./components/RoomList";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { AppContext } from "./components/AppContext";
import Messages from "./components/Messages";
import Input from "./components/Input";
import UserList from "./components/UserList";
import { DispatchEvent } from "./utilities/interfaces";
import ColorPicker from "./components/ColorPicker/ColorPicker";
import SketchPad from "./components/SketchPad";
import Routes from "./Routes";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#527a00",
    },
  },
});


function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [color, setColor] = useState("#1362b0");

  const { socket, connectSocket, disconnectSocket, dispatch } =
    useContext(AppContext);

  useEffect(() => {
    // Connect to socket on refresh
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      connectSocket(undefined, sessionId);
    }
  }, []);

  useEffect(() => {
    if (socket) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [socket]);

  const logout = () => {
    dispatch({
      type: DispatchEvent.Logout
    });
    localStorage.clear();
    disconnectSocket();
  };

function App() {
  return (
    <div className="App">
      {/* <ThemeProvider theme={theme}>
        <Routes />
      </ThemeProvider> */}
      <header className="App-header">
        <p>Connected: {"" + isConnected}</p>
        {!isConnected && (
          <>
            <SignUp />
            <Login />
          </>
        )}
        {isConnected && (
          <>
            {/* For that specific room: */}
            {/* <RoomUserList /> */}
            <UserList />
            <RoomList />
            <Messages />
            <Input />
            <button onClick={logout}>Logout</button>
            <SketchPad color={color} />
            <ColorPicker color={color} setColor={setColor} />
          </>
        )}
      </header>
    </div>
  );
}

export default App;
