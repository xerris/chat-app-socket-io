import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import {
  AuthSection,
  AuthButton,
  SubText,
} from "./../components/Shared/AuthSection";

interface Props {}

const Welcome = (props: Props) => {
  return (
    <AuthSection>
      <Link to="/login" ty>
        <AuthButton variant="contained" color="primary" size="large">
          Login
        </AuthButton>
      </Link>
      <Link to="/signup">
        <AuthButton variant="outlined" color="primary" size="large">
          Sign Up
        </AuthButton>
      </Link>
      <SubText>Continue as guest</SubText>
    </AuthSection>
  );
};

export default Welcome;
