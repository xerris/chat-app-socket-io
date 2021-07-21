import React from "react";
import "./../css/App.css";
import RoomList from "./../components/RoomList";
import Messages from "./../components/Messages";

function Chat() {
  return (
    <div className="App">
      <header className="App-header">
        <RoomList />
        <Messages />
      </header>
    </div>
  );
}

export default Chat;
