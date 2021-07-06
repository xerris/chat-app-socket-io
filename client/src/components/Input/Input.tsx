import React, { useContext, useState } from "react";
import { AppContext } from "../AppContext";

const UserList: React.FC = () => {
  const { state, socket } = useContext(AppContext);
  const [message, setMessage] = useState("");
  const onMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const sendMessage = () => {
    socket.emit("message", {
      room: state.currentRoomId,
      username: state.username,
      message,
      timestamp: Date.now()
    });

    setMessage("");
  };
  return (
    <div>
      <input value={message} onChange={onMessageChange} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default UserList;
