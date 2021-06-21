import React, { useContext, useState } from "react";
import { IMessage, IRoom } from "../../App";
import { ISocketContext, SocketContext } from "../SocketContext";

interface Props {
  messages: IMessage[];
}
const Messages: React.FC<Props> = ({ messages }: Props) => {
  const socket: ISocketContext = useContext(SocketContext);

  return (
    <div>
      {messages.map((message) => (
        <p>
          {message.username}: {message.message}
        </p>
      ))}
    </div>
  );
};

export default Messages;
