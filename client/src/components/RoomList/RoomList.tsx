import React, { useContext } from "react";
import { DispatchEvent, IPrivateMessage } from "../../utilities/interfaces";
import { AppContext } from "../AppContext";
import Logo from "../../xerris-logo.svg";

const RoomList: React.FC = () => {
  const { state, dispatch, socket } = useContext(AppContext);
  const { rooms, currentRoomId, privateMessages } = state;

  return (
    <div className="roomList">
      <img src={Logo} alt="Xerris logo" />
      <h4>Channels</h4>
      {Object.keys(rooms).map((roomId) => {
        return (
          <h5
            key={roomId}
            onClick={() => {
              if (!rooms[roomId].joined) {
                socket.emit("joinRoom", { roomId });
              }
              dispatch({
                type: DispatchEvent.JoinRoomId,
                data: { roomId, private: false }
              });
            }}
            className={currentRoomId === roomId ? "active-2" : "inactive"}
          >
            {rooms[roomId].roomName}
          </h5>
        );
      })}
      <h4>Private messages</h4>
      {Object.values(privateMessages).map((privateMessage: IPrivateMessage) => {
        return (
          <h5
            key={privateMessage.roomId}
            onClick={() => {
              dispatch({
                type: DispatchEvent.JoinPrivateMessageId,
                data: { roomId: privateMessage.roomId, private: true }
              });
            }}
            className={
              currentRoomId === privateMessage.roomId ? "active-2" : "inactive"
            }
          >
            {privateMessage.receivingUser}
          </h5>
        );
      })}
    </div>
  );
};

export default RoomList;
