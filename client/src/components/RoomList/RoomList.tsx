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
  return (
    <div>
      <h4>
        <u>Rooms</u>
      </h4>
      {roomList.map((room) => (
        <h5
          onClick={onChangeRoom}
          className={selectedRoom === room.roomName ? "active-2" : "inactive"}
        >
          {room.roomName}
        </h5>
      ))}
    </div>
  );
};

export default RoomList;
