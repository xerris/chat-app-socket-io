import React, { useContext, useState } from "react";
import { AppContext } from "../AppContext";
import "./Input.css";
import SendButton from "../../assets/sendLogo.svg";

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
      <div className="inputContainer">
        <input className="input" value={message} onChange={onMessageChange} />
        <img
          src={SendButton}
          onClick={sendMessage}
          alt="send"
          className="button"
        />
      </div>
    </form>
  );
};

export default UserList;
