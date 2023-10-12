import React from 'react';
import { useContext } from "react";

export interface AuthContextData {
  isValidSession: () => boolean;
}
export const AuthContext = React.createContext<AuthContextData>({} as AuthContextData);

export const useAuthContext = () => useContext(AuthContext);