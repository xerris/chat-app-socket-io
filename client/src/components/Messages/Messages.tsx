import React, { useContext, useMemo } from "react";
import { IMessage } from "../../utilities/interfaces";
import { AppContext } from "../AppContext";

const Messages: React.FC = () => {
  const { rooms, currentRoomId, username, privateRoomJoined, privateMessages } =
    useContext(AppContext).state;

  const messages = useMemo(() => {
    if (privateRoomJoined && privateMessages[currentRoomId]?.messages) {
      return privateMessages[currentRoomId].messages
        ?.slice()
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    if (rooms[currentRoomId]?.messages) {
      return rooms[currentRoomId].messages
        ?.slice()
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    return [];
  }, [rooms, currentRoomId, privateRoomJoined, privateMessages]);

  return (
    <div>
      <h4>
        <u>Messages</u>
      </h4>
      <div className="message-list">
        {messages.map((message) => {
          return (
            <div className="message" key={message.timestamp}>
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
