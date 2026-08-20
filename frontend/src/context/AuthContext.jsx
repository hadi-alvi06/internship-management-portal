import { createContext, useContext, useState, useEffect } from "react";
import API, { logoutApi } from "../services/api";

const AuthContext = createContext(null);

function readStored(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readStored("token"));
  const [username, setUsername] = useState(readStored("username"));
  const [role, setRole] = useState(readStored("role"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  async function login(usernameInput, password, remember = true) {
    const res = await API.post("/api/auth/login", {
      username: usernameInput,
      password,
    });

    const { token, username: returnedUsername, role: returnedRole } = res.data.data;

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("username", returnedUsername);
    storage.setItem("role", returnedRole);

    setToken(token);
    setUsername(returnedUsername);
    setRole(returnedRole);
  }

  async function logout() {
    try {
      await logoutApi();
    } catch (err) {
      // still clear locally even if the backend call fails
    }

    ["token", "username", "role"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    setToken(null);
    setUsername(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, username, role, loading, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}