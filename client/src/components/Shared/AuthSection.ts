import styled from "styled-components";
import { Button, TextField } from "@material-ui/core";

export const AuthSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

export const AuthButton = styled(Button)`
  width: 350px;
  margin: 16px 0 !important;
`;

export const SubText = styled.p`
  font-size: 0.9em;
  color: #006ebd;
  margin-top: 20px;
`;

export const AuthTextField = styled(TextField)`
width: 350px;
margin: 16px 0 !important;
`