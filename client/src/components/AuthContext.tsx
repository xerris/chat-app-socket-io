import React, { createContext, useEffect, useState } from "react";

export type AuthState = {
  isLoggedIn: boolean;
  id: string | null;
  username: string | null;
  image: string | null;
  token: string | null;
};

const initialState: AuthState = {
  isLoggedIn: false,
  username: null,
  image: null,
  token: null,
  id: null,
};

const AuthContext = createContext(null);

const AuthProvider = ({ children }: any) => {
  return (
    <AuthContext.Provider value={initialState}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
