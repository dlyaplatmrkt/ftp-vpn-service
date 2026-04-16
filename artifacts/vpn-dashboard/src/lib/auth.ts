import { useState, useEffect } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("vpn_access_key"));

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("vpn_access_key"));
  }, []);

  const login = (accessKey: string) => {
    localStorage.setItem("vpn_access_key", accessKey);
    setToken(accessKey);
    setAuthTokenGetter(() => accessKey);
  };

  const logout = () => {
    localStorage.removeItem("vpn_access_key");
    setToken(null);
    setAuthTokenGetter(() => null);
  };

  return { token, login, logout, isAuthenticated: !!token };
}
