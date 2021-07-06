import React, { useContext } from "react";
import { DispatchEvent } from "../../utilities/interfaces";
import { AppContext } from "../AppContext";

const RoomList: React.FC = () => {
  const { state, dispatch, socket } = useContext(AppContext);
  const { rooms, currentRoomId } = state;

  return (
    <div>
      <h4>
        <u>Rooms</u>
      </h4>
      {Object.keys(rooms).map((roomId) => {
        return (
          <h5
            key={roomId}
            onClick={() => {
              if (!rooms[roomId].joined) {
                socket.emit("joinRoom", { roomId });
              }
              dispatch({ type: DispatchEvent.JoinRoomId, data: roomId });
            }}
            className={currentRoomId === roomId ? "active-2" : "inactive"}
          >
            *{rooms[roomId].roomName}
          </h5>
        );
      })}
      <h4>
        <u>DMs</u>
      </h4>
      {/* {privateMessageList.map((room) => {
        return (
          <h5
            key={room.roomId}
            onClick={() => onChangeRoom(room.roomId)}
            className={selectedRoom === room.roomId ? "active-2" : "inactive"}
          >
            DM with {room.receiver}
          </h5>
        );
      })} */}
    </div>
  );
};

export default RoomList;
