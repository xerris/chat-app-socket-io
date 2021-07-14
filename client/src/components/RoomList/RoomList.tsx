import React from "react";
import { IRoom } from "../../App";
import Logo from "../../xerris-logo.svg";
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
    <div className="roomList">
      <img src={Logo} alt="Xerris logo" />
      <h4>Channels</h4>
      {roomList.map((room) => (
        <h5
          key={room.roomId}
          onClick={() => onChangeRoom(room.roomId)}
          className={selectedRoom === room.roomId ? "active-2" : "inactive"}
        >
          {room.roomName}
        </h5>
      ))}
      <h4>Direct messages</h4>
      {privateMessageList.map((room) => (
        <h5
          key={room.roomId}
          onClick={() => onChangeRoom(room.roomId)}
          className={selectedRoom === room.roomId ? "active-2" : "inactive"}
        >
          DM with {room.receiver}
        </h5>
      ))}
    </div>
  );
};

export default RoomList;
