import React from "react";
import { Link } from "react-router-dom";
import {
  AuthSection,
  AuthButton,
  SubText,
} from "./../components/Shared/AuthSection";
import Logo from "../assets/xerris-logo.svg";

interface Props {}

const Welcome = (props: Props) => {
  return (
    <AuthSection className="dark-bg">
      <img className="logo" src={Logo} alt="Xerris logo" />
      <Link to="/login" ty>
        <AuthButton variant="contained" color="primary" size="large">
          Login
        </AuthButton>
      </Link>
      <Link to="/signup">
        <AuthButton variant="contained" color="textPrimary" size="large">
          Sign Up
        </AuthButton>
      </Link>
      <SubText>Continue as guest</SubText>
    </AuthSection>
  );
};

export default Welcome;
