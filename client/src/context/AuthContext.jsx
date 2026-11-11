import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('fb_token') || null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('fb_admin_token') || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fb_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Customer Login
  const customerLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('fb_user', JSON.stringify(userData));
    localStorage.setItem('fb_token', userToken);
  };

  // Customer Logout
  const customerLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fb_user');
    localStorage.removeItem('fb_token');
  };

  // Admin Login
  const adminLogin = (admData, admToken) => {
    setAdminUser(admData);
    setAdminToken(admToken);
    localStorage.setItem('fb_admin_user', JSON.stringify(admData));
    localStorage.setItem('fb_admin_token', admToken);
  };

  // Admin Logout
  const adminLogout = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('fb_admin_user');
    localStorage.removeItem('fb_admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        customerLogin,
        customerLogout,
        adminUser,
        adminToken,
        adminLogin,
        adminLogout,
        isAdmin: !!(adminUser && adminUser.role === 'admin' && adminToken),
        isAuthenticated: !!(user && token)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
