import React, { useContext, useMemo } from "react";
import { AppContext } from "../AppContext";
import Input from "../Input";
import Message from "../Message";
import SketchPad from "../SketchPad";
import "./Messages.css";

const Messages: React.FC = () => {
  const { rooms, currentRoomId, privateRoomJoined, privateMessages } =
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
      <div
        className="sketchPad"
        style={{ display: currentRoomId === "2" ? "block" : "none" }}
      >
        <SketchPad />
      </div>
      <div
        className="messageList"
        style={{ display: currentRoomId === "2" ? "none" : "block" }}
      >
        <div className="messageContainer">
          {messages.map((message) => {
            return (
              <Message
                username={message.username}
                timestamp={message.timestamp}
                message={message.message}
              />
            );
          })}
        </div>
        {currentRoomId !== "2" && <Input />}
      </div>
    </div>
  );
};

export default Messages;
