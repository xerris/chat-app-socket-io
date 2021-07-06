import React, { useContext, useMemo } from "react";
import { DispatchEvent, IPrivateMessage } from "../../utilities/interfaces";
import { AppContext } from "../AppContext";

const UserList: React.FC = () => {
  const { state, socket, dispatch } = useContext(AppContext);
  const { rooms, username, onlineUsers, allUsers, privateMessages } = state;

  const createPrivateMessage = (receiverUsername: string) => {
    if (receiverUsername !== username) {
      socket.emit("createPrivateMessage", {
        senderUsername: username,
        receiverUsername
      });
    }
  };

  return (
    <div>
      <h4>
        <u>All Users (click to DM)</u>
      </h4>
      {allUsers &&
        allUsers.map((user) => (
          <h6
            className={onlineUsers.includes(user) ? "active" : "inactive"}
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
          </h6>
        ))}
    </div>
  );
};

export default UserList;
