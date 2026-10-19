import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, Provider, Ngo, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isVerificationPending: boolean;
  loginAsDemoProvider: () => void;
  loginAsDemoNgo: () => void;
  login: (email: string, role: UserRole) => boolean;
  registerProvider: (data: Omit<Provider, 'id' | 'createdAt' | 'verified'>) => void;
  registerNgo: (data: Omit<Ngo, 'id' | 'createdAt' | 'verified'>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => api.getCurrentUser());
  const [isVerificationPending, setIsVerificationPending] = useState(false);

  useEffect(() => {
    // If newly registered, simulate the verification delay
    if (isVerificationPending) {
      const timer = setTimeout(() => {
        setIsVerificationPending(false);
        if (user) {
          const updatedUser = { ...user, verified: true };
          setUser(updatedUser);
          api.setCurrentUser(updatedUser);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVerificationPending, user]);

  const loginAsDemoProvider = () => {
    const providers = api.getProviders();
    const demoProv = providers[0]; // Shree Ganesh Banquet
    const authUser: AuthUser = {
      id: demoProv.id,
      role: 'provider',
      name: demoProv.orgName,
      email: demoProv.email,
      verified: true,
      data: demoProv
    };
    setUser(authUser);
    api.setCurrentUser(authUser);
  };

  const loginAsDemoNgo = () => {
    const ngos = api.getNgos();
    const demoNgo = ngos[0]; // Roti Bank Pune
    const authUser: AuthUser = {
      id: demoNgo.id,
      role: 'ngo',
      name: demoNgo.name,
      email: demoNgo.email,
      verified: true,
      data: demoNgo
    };
    setUser(authUser);
    api.setCurrentUser(authUser);
  };

  const login = (email: string, role: UserRole): boolean => {
    if (role === 'provider') {
      const prov = api.getProviders().find(p => p.email.toLowerCase() === email.toLowerCase());
      if (prov) {
        const authUser: AuthUser = {
          id: prov.id,
          role: 'provider',
          name: prov.orgName,
          email: prov.email,
          verified: prov.verified,
          data: prov
        };
        setUser(authUser);
        api.setCurrentUser(authUser);
        return true;
      }
    } else {
      const ngo = api.getNgos().find(n => n.email.toLowerCase() === email.toLowerCase());
      if (ngo) {
        const authUser: AuthUser = {
          id: ngo.id,
          role: 'ngo',
          name: ngo.name,
          email: ngo.email,
          verified: ngo.verified,
          data: ngo
        };
        setUser(authUser);
        api.setCurrentUser(authUser);
        return true;
      }
    }
    return false;
  };

  const registerProvider = (data: Omit<Provider, 'id' | 'createdAt' | 'verified'>) => {
    const newProv = api.createProvider(data);
    const authUser: AuthUser = {
      id: newProv.id,
      role: 'provider',
      name: newProv.orgName,
      email: newProv.email,
      verified: false,
      data: newProv
    };
    setUser(authUser);
    api.setCurrentUser(authUser);
    setIsVerificationPending(true);
  };

  const registerNgo = (data: Omit<Ngo, 'id' | 'createdAt' | 'verified'>) => {
    const newNgo = api.createNgo(data);
    const authUser: AuthUser = {
      id: newNgo.id,
      role: 'ngo',
      name: newNgo.name,
      email: newNgo.email,
      verified: false,
      data: newNgo
    };
    setUser(authUser);
    api.setCurrentUser(authUser);
    setIsVerificationPending(true);
  };

  const logout = () => {
    setUser(null);
    api.setCurrentUser(null);
    setIsVerificationPending(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isVerificationPending,
        loginAsDemoProvider,
        loginAsDemoNgo,
        login,
        registerProvider,
        registerNgo,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
