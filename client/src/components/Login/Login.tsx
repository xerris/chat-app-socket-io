import React, { useContext, useState } from "react";
import { fetchPostOptions, apiPrefix } from "../../config/constants";
import { DispatchEvent } from "../../utilities/interfaces";
import { AppContext } from "../AppContext";

const Login: React.FC = () => {
  const { connectSocket, dispatch } = useContext(AppContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const login = async (event) => {
    event.preventDefault();
    const res = await fetch(`${apiPrefix}/api/login`, {
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
      dispatch({ action: DispatchEvent.SetUsername, data: res.username });
      connectSocket(res.username);
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
