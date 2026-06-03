import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("clickpilot_token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("clickpilot_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((response) => {
        setUser(response.data.user);
        localStorage.setItem("clickpilot_user", JSON.stringify(response.data.user));
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem("clickpilot_token", authToken);
    localStorage.setItem("clickpilot_user", JSON.stringify(authUser));
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("clickpilot_token");
    localStorage.removeItem("clickpilot_user");
  };

  const value = useMemo(
    () => ({ token, user, loading, login, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
