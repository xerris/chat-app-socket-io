import React, { useState, useEffect, useContext } from "react";
import "./../css/App.css";
import RoomList from "./../components/RoomList";
import ColorPicker from "../components/ColorPicker/ColorPicker";
import SketchPad from "../components/SketchPad";
import { AppContext } from "./../components/AppContext";
import { DispatchEvent } from "./../utilities/interfaces";
import Messages from "./../components/Messages";
import Input from "./../components/Input";
import UserList from "./../components/UserList";

function Chat() {
  const [isConnected, setIsConnected] = useState(false);
  const [color, setColor] = useState("#1362b0");

  const { socket, connectSocket, disconnectSocket, dispatch } =
    useContext(AppContext);

  const logout = () => {
    dispatch({
      type: DispatchEvent.Logout,
    });
    localStorage.clear();
    disconnectSocket();
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Connected: {"" + isConnected}</p>
        {/* {!isConnected && (
          <>
            <SignUp />
            <Login />
          </>
        )} */}
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

export default Chat;
