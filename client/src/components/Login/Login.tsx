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
  );
};

export default Login;
