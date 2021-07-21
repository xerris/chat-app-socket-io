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
import Logo from "../../assets/xerris-logo.svg";
import { useHistory } from "react-router-dom";

interface Props {}

const SignUp = (props: Props) => {
  const history = useHistory();
  const [status, setStatus] = useState("");

  const submitSignUp = async (
    email: string,
    password: string,
    username: string
  ) => {
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
          history.push("/login");
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
        .max(20, "Can not exceed 20 characters"),
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .min(6, "Must be 6 characters at least")
        .required("Required"),
    }),
    onSubmit: (values) =>
      submitSignUp(values.email, values.password, values.username),
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
        autoComplete="off"
        onKeyPress={onKeyUp}
        helperText={formik.touched.username && formik.errors.username}
        error={formik.touched.username && !!formik.errors.username}
        {...formik.getFieldProps("username")}
      />
      <AuthTextField
        id="email"
        label="Email"
        variant="outlined"
        autoComplete="off"
        onKeyPress={onKeyUp}
        helperText={formik.touched.email && formik.errors.email}
        error={formik.touched.email && !!formik.errors.email}
        {...formik.getFieldProps("email")}
      />
      <AuthTextField
        id="password"
        label="Password"
        type="password"
        variant="outlined"
        onKeyPress={onKeyUp}
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

export default SignUp;
