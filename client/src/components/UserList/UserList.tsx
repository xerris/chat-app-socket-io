import React, { useContext, useMemo } from "react";
import { AppContext } from "../AppContext";

const UserList: React.FC = () => {
  const { state, socket } = useContext(AppContext);
  const { rooms, username, currentRoomId, onlineUsers } = state;

  const createPrivateMessage = (receiverUsername: string) => {
    if (receiverUsername !== username) {
      socket.emit("createPrivateMessage", {
        senderUsername: username,
        receiverUsername
      });
    }
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
      {roomUsers.map((user) => (
        <h6
          className={onlineUsers.includes(user) ? "active" : "inactive"}
          onClick={() => createPrivateMessage(user)}
          key={user}
        >
          {user}
        </h6>
      ))}
    </div>
  );
};

export default UserList;
