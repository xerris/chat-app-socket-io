import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Main from "../pages/Main";
import Login from "./../components/Login";
import SignUp from "./../components/SignUp";

interface Props {}

const Routes = (props: Props) => {
  return (
    <Router>
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/signup" exact component={SignUp} />
        <Route path="/" exact component={Main} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
};

export default Routes;
