import React, { createContext, useContext, useState, useEffect } from "react";

export type AuthContextType = {
  user: any;
  role: string | null;
  setUser: (user: any) => void;
  setRole: (role: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  // Load saved user/role on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("mms_user");
    const savedRole = localStorage.getItem("mms_role");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedRole) setRole(savedRole);
  }, []);

  // Save to storage any time they change
  useEffect(() => {
    if (user) localStorage.setItem("mms_user", JSON.stringify(user));
    if (role) localStorage.setItem("mms_role", role);
  }, [user, role]);

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("mms_user");
    localStorage.removeItem("mms_role");
    

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
