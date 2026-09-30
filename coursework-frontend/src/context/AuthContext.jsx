import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    email: localStorage.getItem("email"),
    learnerId: localStorage.getItem("learnerId"),
  });

  function login({ token, role, email, learnerId }) {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("email", email);
    localStorage.setItem("learnerId", learnerId || "");
    setAuth({ token, role, email, learnerId });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("learnerId");
    setAuth({ token: null, role: null, email: null, learnerId: null });
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}