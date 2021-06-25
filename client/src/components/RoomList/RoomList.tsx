import React from "react";
import { IRoom } from "../../App";

interface Props {
  roomList: IRoom[];
  privateMessageList: IRoom[];
  onChangeRoom: (room) => void;
  selectedRoom: string;
}
const RoomList: React.FC<Props> = ({
  roomList,
  privateMessageList,
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
          key={room.roomId}
          onClick={() => onChangeRoom(room.roomId)}
          className={selectedRoom === room.roomId ? "active-2" : "inactive"}
        >
          {room.roomName}
        </h5>
      ))}
      <h4>
        <u>DMs</u>
      </h4>
      {privateMessageList.map((room) => (
        <h5
          key={room.roomId}
          onClick={() => onChangeRoom(room.roomId)}
          className={selectedRoom === room.roomId ? "active-2" : "inactive"}
        >
          {room.roomName}
        </h5>
      ))}
    </div>
  );
};

export default RoomList;
