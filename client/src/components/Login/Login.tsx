import React, {
  ReactEventHandler,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { fetchPostOptions } from "../../config/constants";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async (event) => {
    event.preventDefault();
    console.log("🚀 ~ file: Login.tsx ~ line 14 ~ login ~ event", event);
    const res = await fetch("http://localhost:3001/login", {
      ...fetchPostOptions,
      body: JSON.stringify({
        username,
        password
      })
    });
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  return (
    <div>
      <form>
        <input value={username} onChange={handleUsernameChange} />
        <input
          value={password}
          type="password"
          onChange={handlePasswordChange}
        />
        <button onClick={login}>Login</button>
      </form>
    </div>
  );
};

export default Login;
