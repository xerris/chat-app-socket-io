import React from "react";
import { IMessage } from "../../App";

interface Props {
  messages: IMessage[];
  username: string;
}
const Messages: React.FC<Props> = ({ messages, username }: Props) => {
  return (
    <div>
      <h4>
        <u>Messages</u>
      </h4>
      <div className="message-list">
        {messages.map((message) => (
          <div className="message">
            <span
              className={
                message.username === username ? "active-2" : "inactive"
              }
            >
              <strong>{message.username}:</strong>
            </span>
            <span>{message.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
