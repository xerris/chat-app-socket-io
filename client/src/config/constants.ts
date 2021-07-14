export const fetchPostOptions = {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8"
  }
};

export const prefix = process.env.REACT_APP_ENV === "dev" ? "http://localhost:3001" : "";
export const apiPrefix =
  process.env.REACT_APP_ENV === "dev" ? "http://localhost:3001" : "";
