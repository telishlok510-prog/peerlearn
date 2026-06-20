import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios.js";

// This "context" lets any page know who is logged in, and lets them
// log in / log out, without passing data through every component.
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app first loads, check if a token is saved. If so, ask the
  // backend "who am I?" to restore the logged-in session.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  // Save token + user after a successful login or register.
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Shortcut hook so pages can do: const { user, login } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
