import React, { useContext, useState } from "react";
import { IRoom } from "../../App";
import { ISocketContext, SocketContext } from "../SocketContext";

interface Props {
  roomList: IRoom[];
  onChangeRoom: (room) => void;
  selectedRoom: string;
}
const RoomList: React.FC<Props> = ({
  roomList,
  onChangeRoom,
  selectedRoom
}: Props) => {
  const socket: ISocketContext = useContext(SocketContext);

  return (
    <div>
      {roomList.map((room) => (
        <h5
          onClick={onChangeRoom}
          style={{ color: selectedRoom === room.roomName && "red" }}
        >
          {room.roomName}
        </h5>
      ))}
    </div>
  );
};

export default RoomList;
