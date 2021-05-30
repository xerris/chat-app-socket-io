import React from "react";
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

const signUpSubmit = (email: string, password: string, username: string) => {};

const SignUp = (props: Props) => {
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
      signUpSubmit(values.email, values.password, values.username),
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

export default SignUp;
