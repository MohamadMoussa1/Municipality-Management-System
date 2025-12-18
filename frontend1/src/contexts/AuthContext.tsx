import React, { createContext, useContext, useState, useEffect } from "react";

export type AuthContextType = {
  user: string | null;           // only the name
  role: string | null;
  setUser: (user: string | null) => void;
  setRole: (role: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Load saved user/role on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");

    if (savedUser) setUser(savedUser); 
    if (savedRole) setRole(savedRole);
  }, []);

  // Save to storage any time they change
  useEffect(() => {
    if (user) localStorage.setItem("user", user); 
    else localStorage.removeItem("user");

    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [user, role]);

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, role, setUser, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
