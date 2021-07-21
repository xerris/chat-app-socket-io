import React, { useState } from "react";
import { fetchPostOptions, apiPrefix } from "../../config/constants";
import {
  AuthSection,
  AuthButton,
  SubText,
  AuthTextField,
} from "./../Shared/AuthSection";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Props {}

const SignUp = (props: Props) => {
  const [status, setStatus] = useState("");

  const submitSignUp = async (
    email: string,
    password: string,
    username: string
  ) => {
    // const signup = async (event) => {
    // event.preventDefault();
    await fetch(`${apiPrefix}/api/SignUp`, {
      ...fetchPostOptions,
      body: JSON.stringify({
        username,
        password,
        email,
      }),
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

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(2, "Must be 2 characters at least")
        .required("Required")
        .max(12, "Can not exceed 12 characters"),
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .min(6, "Must be 6 characters at least")
        .required("Required")
        .max(20, "Can not exceed 20 characters"),
    }),
    onSubmit: (values) =>
      submitSignUp(values.email, values.password, values.username),
  });

  return (
    <AuthSection>
      <AuthTextField
        id="username"
        label="Username"
        variant="outlined"
        helperText={formik.touched.username && formik.errors.username}
        error={formik.touched.username && !!formik.errors.username}
        {...formik.getFieldProps("username")}
      />
      <AuthTextField
        id="email"
        label="Email"
        variant="outlined"
        helperText={formik.touched.email && formik.errors.email}
        error={formik.touched.email && !!formik.errors.email}
        {...formik.getFieldProps("email")}
      />
      <AuthTextField
        id="password"
        label="Password"
        type="password"
        variant="outlined"
        helperText={formik.touched.password && formik.errors.password}
        error={formik.touched.password && !!formik.errors.password}
        {...formik.getFieldProps("password")}
      />
      <AuthButton
        type="submit"
        variant={"contained"}
        onClick={formik.handleSubmit}
        size="large"
        color="primary"
      >
        Sign Up
      </AuthButton>
      <Link to="/login">
        <SubText>Already a member? Login</SubText>
      </Link>
    </AuthSection>
  );
};

// import React, { useState } from "react";
// import { fetchPostOptions, prefix } from "../../config/constants";

// const SignUp: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [status, setStatus] = useState("");

//   const signup = async (event) => {
//     event.preventDefault();
//     await fetch(`${prefix}/api/SignUp`, {
//       ...fetchPostOptions,
//       body: JSON.stringify({
//         username,
//         password,
//         email
//       })
//     })
//       .then((res) => {
//         if (res?.status === 200) {
//           setStatus("success");
//         } else {
//           setStatus("Error");
//         }
//       })
//       .catch((err) => setStatus("Error"));
//   };

//   const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setUsername(event.target.value);
//   };
//   const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setEmail(event.target.value);
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
//           backgroundColor: "#90e39a"
//         }}
//       >
//         <h5>Sign Up</h5>
//         <input placeholder="email" value={email} onChange={handleEmailChange} />
//         <input
//           placeholder="username"
//           value={username}
//           onChange={handleUsernameChange}
//         />
//         <input
//           value={password}
//           type="password"
//           placeholder="password"
//           onChange={handlePasswordChange}
//         />
//         <button onClick={signup}>Sign Up</button>
//         {status && <p>{status}</p>}
//       </form>
//     </div>
//   );
// };

export default SignUp;
