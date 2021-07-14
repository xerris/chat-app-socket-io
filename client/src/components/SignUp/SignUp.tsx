import React, { useState } from "react";
import { fetchPostOptions, apiPrefix } from "../../config/constants";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const signup = async (event) => {
    event.preventDefault();
    await fetch(`${apiPrefix}/api/SignUp`, {
      ...fetchPostOptions,
      body: JSON.stringify({
        username,
        password,
        email
      })
    })
      .then((res) => {
        if (res?.status === 200) {
          setStatus("success");
        } else {
          setStatus("Error");
        }
      })
      .catch((err) => setStatus("Error"));
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
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
          backgroundColor: "#90e39a"
        }}
      >
        <h5>Sign Up</h5>
        <input placeholder="email" value={email} onChange={handleEmailChange} />
        <input
          placeholder="username"
          value={username}
          onChange={handleUsernameChange}
        />
        <input
          value={password}
          type="password"
          placeholder="password"
          onChange={handlePasswordChange}
        />
        <button onClick={signup}>Sign Up</button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
};

export default SignUp;
