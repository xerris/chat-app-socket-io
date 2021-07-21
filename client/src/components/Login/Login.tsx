import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useFormik, FormikErrors } from "formik";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import {
  AuthSection,
  AuthButton,
  SubText,
  AuthTextField,
} from "./../Shared/AuthSection";
import { fetchPostOptions, apiPrefix } from "../../config/constants";
import { DispatchEvent } from "../../utilities/interfaces";
import { AppContext } from "../AppContext";
import Logo from "../../assets/xerris-logo.svg";

interface LoginForm {
  username: string;
  password: string;
}

const Login = () => {
  const history = useHistory();

  const { connectSocket, dispatch } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  const loginSubmit = async (
    username: string,
    password: string,
    setErrors: (errors: FormikErrors<LoginForm>) => void
  ) => {
    const res = await fetch(`${apiPrefix}/api/login`, {
      ...fetchPostOptions,
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .catch((err) => console.log(err));
    if (res?.email) {
      dispatch({ action: DispatchEvent.SetUsername, data: res.username });
      connectSocket(res.username);
      history.push("/");
    } else {
      setErrors({ username: "Login error. Check your username and password." });
    }
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Required"),
      password: Yup.string()
        .min(6, "Must be 6 characters at least")
        .required("Required")
        .max(20, "Can not exceed 20 characters"),
    }),
    onSubmit: (values, { setErrors }) =>
      loginSubmit(values.username, values.password, setErrors),
  });

  const onKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      formik.handleSubmit();
    }
  };

  return (
    <AuthSection className="dark-bg">
      <Link to="/">
        <img className="logo" src={Logo} alt="Xerris logo" />
      </Link>
      <AuthTextField
        id="username"
        label="Username"
        variant="outlined"
        type="text"
        color="primary"
        autoComplete="off"
        onKeyPress={onKeyUp}
        helperText={formik.touched.username && formik.errors.username}
        error={formik.touched.username && !!formik.errors.username}
        {...formik.getFieldProps("username")}
      />
      <AuthTextField
        id="password"
        label="Password"
        variant="outlined"
        type="password"
        color="primary"
        onKeyPress={onKeyUp}
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
  );
};

export default Login;
