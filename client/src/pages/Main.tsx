import Welcome from "./Welcome";
import Chat from "./Chat";
import "./../css/main.css";

import { AuthContext, AuthProvider } from "./../components/AuthContext";

interface Props {}

const Main = (props: Props) => {
  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {(value) => (
          <div className="main">
            {value.isLoggedIn ? <Chat /> : <Welcome />}
          </div>
        )}
      </AuthContext.Consumer>
    </AuthProvider>
  );
};

export default Main;
