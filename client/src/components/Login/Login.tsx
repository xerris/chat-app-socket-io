import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import {
  AuthSection,
  AuthButton,
  SubText,
  AuthTextField,
} from "./../Shared/AuthSection";

interface Props {}

const Login = (props: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const loginSubmit = async (email: string, password: string) => {};

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .min(6, "Must be 6 characters at least")
        .required("Required")
        .max(20, "Can not exceed 20 characters"),
    }),
    onSubmit: (values) => loginSubmit(values.email, values.password),
  });

  return (
    <AuthSection>
      <AuthTextField
        id="email"
        label="Email"
        variant="outlined"
        type="primary"
        color="secondary"
        helperText={formik.touched.email && formik.errors.email}
        error={formik.touched.email && !!formik.errors.email}
        {...formik.getFieldProps("email")}
      />
      <AuthTextField
        color="primary"
        id="password"
        label="Password"
        variant="outlined"
        type="password"
        {...formik.getFieldProps("password")}
        helperText={formik.touched.password && formik.errors.password}
        error={formik.touched.password && !!formik.errors.password}
      />
      <AuthButton
        type="submit"
        variant={"contained"}
        onClick={formik.handleSubmit}
        size="large"
        color="primary"
      >
        Login
      </AuthButton>
      <Link to="/signup">
        <SubText>Don't have an account? Sign Up</SubText>
      </Link>
    </AuthSection>
  )
}

// import { Socket } from "dgram";
// import React, { useContext, useState } from "react";
// import { fetchPostOptions, prefix } from "../../config/constants";
// import { DispatchEvent } from "../../utilities/interfaces";
// import { AppContext } from "../AppContext";

// const Login: React.FC = () => {
//   const { connectSocket, dispatch } = useContext(AppContext);
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");

//   const login = async (event) => {
//     event.preventDefault();
//     const res = await fetch(`${prefix}/api/login`, {
//       ...fetchPostOptions,
//       body: JSON.stringify({
//         username,
//         password
//       })
//     })
//       .then((res) => {
//         if (res.status === 200) {
//           return res.json();
//         }
//       })
//       .catch((err) => console.log(err));
//     if (res?.email) {
//       setEmail(res.email);
//       setError("");
//       dispatch({ action: DispatchEvent.SetUsername, data: res.username });
//       connectSocket(res.username);
//     } else {
//       setError("Login Error");
//     }
//   };

//   const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setUsername(event.target.value);
//   };
//   const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setPassword(event.target.value);
//   };
//   return (
//     <div>
//       <form
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           backgroundColor: "#261447"
//         }}
//       >
//         <h5>Login</h5>

//         {email ? (
//           <p>Logged in as {email}</p>
//         ) : (
//           <>
//             <input
//               placeholder="username"
//               value={username}
//               onChange={handleUsernameChange}
//             />
//             <input
//               placeholder="password"
//               value={password}
//               type="password"
//               onChange={handlePasswordChange}
//             />
//             <button onClick={login}>Login</button>
//           </>
//         )}

//         {error && <p>{error}</p>}
//       </form>
//     </div>
//   );
// };

export default Login;
