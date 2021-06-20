import { Socket } from "dgram";
import React, { useContext, useState } from "react";
import { fetchPostOptions, prefix } from "../../config/constants";
import { ISocketContext, SocketContext } from "../SocketContext";

interface Props {
  onLogin: (username: string) => void;
}
const Login: React.FC<Props> = ({ onLogin }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const socket: ISocketContext = useContext(SocketContext);

  const login = async (event) => {
    event.preventDefault();
    const res = await fetch(`${prefix}/api/login`, {
      ...fetchPostOptions,
      body: JSON.stringify({
        username,
        password
      })
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .catch((err) => console.log(err));
    if (res?.email) {
      setEmail(res.email);
      setError("");
      socket.connectSocket(res.username);
      onLogin(res.username);
    } else {
      setError("Login Error");
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  return (
    <div>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#261447"
        }}
      >
        <h5>Login</h5>

        {email ? (
          <p>Logged in as {email}</p>
        ) : (
          <>
            <input
              placeholder="username"
              value={username}
              onChange={handleUsernameChange}
            />
            <input
              placeholder="password"
              value={password}
              type="password"
              onChange={handlePasswordChange}
            />
            <button onClick={login}>Login</button>
          </>
        )}

        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
