import React from "react";

interface Props {
  usersInRoom: string[];
  onlineUsers: string[];
  createPrivateMessage: (user: string) => void;
}
const UserList: React.FC<Props> = ({
  usersInRoom,
  onlineUsers,
  createPrivateMessage
}: Props) => {
  return (
    <div>
      <h4>
        <u>Room Users</u>
      </h4>
      {usersInRoom
        .sort((a, b) =>
          a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase())
        )
        .map((user) => (
          <h6
            className={onlineUsers.includes(user) ? "active" : "inactive"}
            onClick={() => createPrivateMessage(user)}
          >
            {user}
          </h6>
        ))}
    </div>
  );
};

export default UserList;
