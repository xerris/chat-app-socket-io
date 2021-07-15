import React, { useContext, useState } from "react";
import { AppContext } from "../AppContext";
import "./Input.css";

const UserList: React.FC = () => {
  const { state, socket } = useContext(AppContext);
  const [message, setMessage] = useState("");
  const onMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const sendMessage = (event) => {
    event.preventDefault();
    socket.emit("message", {
      room: state.currentRoomId,
      username: state.username,
      message,
      timestamp: Date.now(),
      privateMessage: state.privateRoomJoined
    });

    setMessage("");
  };
  return (
    <form onSubmit={sendMessage}>
      <input className="input" value={message} onChange={onMessageChange} />
      <button type="button">Send</button>
    </form>
  );
};

export default UserList;
