import React, { useContext, useMemo } from "react";
import { DispatchEvent, IPrivateMessage } from "../../utilities/interfaces";
import { AppContext } from "../AppContext";

const UserList: React.FC = () => {
  const { state, socket, dispatch } = useContext(AppContext);
  const { rooms, username, currentRoomId, onlineUsers, privateMessages } =
    state;

  const createPrivateMessage = (receiverUsername: string) => {
    if (receiverUsername !== username) {
      socket.emit("createPrivateMessage", {
        senderUsername: username,
        receiverUsername
      });
    }
  };
  const joinRoom = (roomId: string) => {
    socket.emit("joinRoom", {
      roomId
    });
  };

  const roomUsers = useMemo(() => {
    if (rooms[currentRoomId]) {
      return rooms[currentRoomId].users;
    }
    return [];
  }, [rooms, currentRoomId]);

  return (
    <div>
      <h4>
        <u>Room Users (click to DM)</u>
      </h4>
      {roomUsers &&
        roomUsers.map((user) => (
          <h6
            className={onlineUsers.includes(user) ? "active" : "inactive"}
            onClick={() => {
              let privateMessageId = Object.keys(privateMessages).find(
                (privateMessageId) =>
                  privateMessages[privateMessageId].receivingUser === user
              );
              if (!privateMessageId) {
                console.log("Creating private message!");
                createPrivateMessage(user);
              } else {
                dispatch({
                  type: DispatchEvent.JoinPrivateMessageId,
                  data: {
                    private: true,
                    roomId: privateMessageId
                  }
                });
              }

              const privateRoom: any = Object.values(privateMessages).find(
                (privateMessage: IPrivateMessage) =>
                  privateMessage.receivingUser === user
              );

              if (privateRoom?.roomId) {
                joinRoom(privateRoom.roomId);
              }
            }}
            key={user}
          >
            {user}
          </h6>
        ))}
    </div>
  );
};

export default UserList;
