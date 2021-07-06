import React, { useContext, useMemo } from "react";
import { IMessage } from "../../utilities/interfaces";
import { AppContext } from "../AppContext";

const Messages: React.FC = () => {
  const { rooms, currentRoomId, username } = useContext(AppContext).state;

  const messages = useMemo(() => {
    if (rooms[currentRoomId]?.messages) {
      return rooms[currentRoomId].messages
        ?.slice()
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    return [];
  }, [rooms, currentRoomId]);

  return (
    <div>
      <h4>
        <u>Messages</u>
      </h4>
      <div className="message-list">
        {messages.map((message) => {
          console.log(
            "🚀 ~ file: Messages.tsx ~ line 24 ~ {messages.map ~ message",
            message
          );
          return (
            <div className="message" key={message.SK}>
              <span
                className={
                  message.username === username ? "active-2" : "inactive"
                }
              >
                <strong>{message.username}:</strong>
              </span>
              <span>{message.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
