import React from "react";
import "./Message.css";

interface Props {
  timestamp: string;
  message: string;
  username: string;
}

const Message: React.FC<Props> = ({ timestamp, message, username }: Props) => {
  return (
    <div className="message" key={timestamp}>
      <span className="username">{username} </span>
      <span className="messageContent">{message}</span>
    </div>
  );
};

export default Message;
