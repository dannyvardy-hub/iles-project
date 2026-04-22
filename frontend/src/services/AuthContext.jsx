import { createContext, useContext, useState } from "react";
import { getUser, isAuthenticated, logout as doLogout } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser);
  const [authenticated, setAuthenticated] = useState(isAuthenticated);

  const login = (userData) => {
    setUser(userData);
    setAuthenticated(true);
  };

  const logout = () => {
    doLogout();
    setUser(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);