import React, { useContext, useMemo } from "react";
import { AppContext } from "../AppContext";
import Input from "../Input";
import SketchPad from "../SketchPad";
import "./Messages.css";

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
      <div className="sketchPad">{currentRoomId === "2" && <SketchPad />}</div>
      <div className="messageList">
        {currentRoomId !== "2" &&
          messages.map((message) => {
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
        {currentRoomId !== "2" && <Input />}
      </div>
    </div>
  );
};

export default Messages;
