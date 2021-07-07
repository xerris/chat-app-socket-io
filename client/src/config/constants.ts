export const fetchPostOptions = {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8"
  }
};

export const prefix =
  process.env.REACT_APP_ENV === "dev"
    ? "ws://socket-app-load-balancer-598626749.us-east-2.elb.amazonaws.com"
    : "";
export const apiPrefix =
  process.env.REACT_APP_ENV === "dev"
    ? "http://socket-app-load-balancer-598626749.us-east-2.elb.amazonaws.com"
    : "";
