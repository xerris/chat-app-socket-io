import React, { useContext } from "react";
import { DispatchEvent, IPrivateMessage } from "../../utilities/interfaces";
import { AppContext } from "../AppContext";
import Logo from "../../xerris-logo.svg";
import "./RoomList.css";

const RoomList: React.FC = () => {
  const { state, dispatch, socket, disconnectSocket } = useContext(AppContext);
  console.log("🚀 ~ file: RoomList.tsx ~ line 8 ~ socket", socket);
  const {
    rooms,
    currentRoomId,
    privateMessages,
    onlineUsers,
    username,
    allUsers
  } = state;

  const createPrivateMessage = (receiverUsername: string) => {
    if (receiverUsername !== username) {
      socket.emit("createPrivateMessage", {
        senderUsername: username,
        receiverUsername
      });
    }
  };

  const logout = () => {
    dispatch({
      type: DispatchEvent.Logout
    });
    localStorage.clear();
    disconnectSocket();
  };

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
      <h4>Users</h4>
      {onlineUsers &&
        onlineUsers
          .filter((user) => user !== username)
          .map((user) => (
            <h5
              className={"active"}
              onClick={() => {
                let privateMessage: any = Object.values(privateMessages).find(
                  (privateMessage: IPrivateMessage) =>
                    privateMessage.receivingUser === user
                );

                if (!privateMessage?.roomId) {
                  console.log("Creating private message!");
                  createPrivateMessage(user);
                } else {
                  dispatch({
                    type: DispatchEvent.JoinPrivateMessageId,
                    data: {
                      private: true,
                      roomId: privateMessage?.roomId
                    }
                  });
                }
              }}
              key={user}
            >
              {user}
            </h5>
          ))}
      {allUsers &&
        allUsers
          .filter((user) => !onlineUsers.includes(user) && user !== username)
          .map((user) => (
            <h5
              className={"inactive"}
              onClick={() => {
                let privateMessage: any = Object.values(privateMessages).find(
                  (privateMessage: IPrivateMessage) =>
                    privateMessage.receivingUser === user
                );

                if (!privateMessage?.roomId) {
                  console.log("Creating private message!");
                  createPrivateMessage(user);
                } else {
                  dispatch({
                    type: DispatchEvent.JoinPrivateMessageId,
                    data: {
                      private: true,
                      roomId: privateMessage?.roomId
                    }
                  });
                }
              }}
              key={user}
            >
              {user}
            </h5>
          ))}
      <div className="logout">
        <h5 onClick={logout}>Logout</h5>
      </div>
    </div>
  );
};

export default RoomList;
