import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext.jsx";
import api, { setAuthToken, getAuthToken } from "../utils/api.js";

const AuthContext = createContext();
const AUTH_STORAGE_KEY = "priyas_boutique_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const { addToast } = useToast();

  // Validate session on load if token exists
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.get("/api/auth/me")
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // Token invalid or backend unreachable; keep saved local user state if valid
        });
    }
  }, []);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to sync auth state", e);
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      if (response && response.token) {
        setAuthToken(response.token);
        setUser(response.user);
        addToast(`Welcome back, ${response.user.name}!`, "success");
        return { success: true, user: response.user };
      }
    } catch (err) {
      console.warn("API login notice:", err.message);
    }

    // Fallback for demo testing if backend is connecting
    if (email.toLowerCase() === "admin@priyasboutique.com" && (password === "admin123" || password === "admin")) {
      const demoAdmin = { id: "admin-1", name: "Priya (Admin)", email, role: "admin" };
      setUser(demoAdmin);
      addToast("Logged in successfully as Admin!", "success");
      return { success: true, user: demoAdmin };
    }

    addToast("Invalid email or password", "error");
    return { success: false, error: "Invalid credentials" };
  };

  const register = async (name, email, password) => {
    if (!name || !email || !password) {
      addToast("Please fill in all required fields", "error");
      return { success: false, error: "Missing fields" };
    }

    try {
      const response = await api.post("/api/auth/register", { name, email, password });
      if (response && response.token) {
        setAuthToken(response.token);
        setUser(response.user);
        addToast("Account created successfully!", "success");
        return { success: true, user: response.user };
      }
    } catch (err) {
      addToast(err.message || "Registration failed. Please try again.", "error");
      return { success: false, error: err.message };
    }

    return { success: false, error: "Registration failed" };
  };

  const logout = () => {
    setAuthToken("");
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    addToast("Logged out successfully", "info");
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin }}>
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
