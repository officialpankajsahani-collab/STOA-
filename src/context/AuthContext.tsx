import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, OwnerUser, AdminUser } from '../types/index.js';

interface AuthContextType {
  user: (OwnerUser | AdminUser) | null;
  role: UserRole | null;
  isLoading: boolean;
  loginAsOwner: (vehicleNumber: string, mobile: string) => Promise<{ success: boolean; error?: string; demoOtp?: string; canRegister?: boolean }>;
  verifyOwnerOtp: (vehicleNumber: string, otp: string, mobile?: string) => Promise<{ success: boolean; error?: string }>;
  registerOwner: (data: { ownerName: string; vehicleNumber: string; mobile: string; category: string; capacityTon: number; membershipNumber?: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsAdmin: (adminId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  updateOwnerProfile: (data: { ownerName?: string; mobile?: string; photoUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'stoa_session_user';

const DEFAULT_OWNER_USER: OwnerUser = {
  id: 'veh-001',
  vehicleNumber: 'OD15X7273',
  ownerName: 'रमेश कुमार साहु (Ramesh Sahu)',
  mobile: '9861012345',
  membershipNumber: 'STOA-M-0412',
  role: 'OWNER',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(OwnerUser | AdminUser) | null>(DEFAULT_OWNER_USER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'LOGGED_OUT') {
        setUser(null);
      } else if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } else {
        setUser(DEFAULT_OWNER_USER);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_OWNER_USER));
      }
    } catch (e) {
      console.error('Failed to load session:', e);
      setUser(DEFAULT_OWNER_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (u: (OwnerUser | AdminUser) | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.setItem(STORAGE_KEY, 'LOGGED_OUT');
    }
  };

  const loginAsOwner = async (vehicleNumber: string, mobile: string) => {
    try {
      const res = await fetch('/api/auth/owner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleNumber, mobile }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'लॉगिन विफल', canRegister: data.canRegister };
      }
      return { success: true, demoOtp: data.demoOtp };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const verifyOwnerOtp = async (vehicleNumber: string, otp: string, mobile?: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleNumber, otp, mobile }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'OTP सत्यापन विफल' };
      }
      saveSession(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const registerOwner = async (payload: any) => {
    try {
      const res = await fetch('/api/auth/owner-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'पंजीकरण विफल' };
      }
      saveSession(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const loginAsAdmin = async (adminId: string, pin: string) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'एडमिन लॉगिन विफल' };
      }
      saveSession(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const logout = () => {
    saveSession(null);
  };

  const updateOwnerProfile = async (data: { ownerName?: string; mobile?: string; photoUrl?: string }) => {
    if (!user || user.role !== 'OWNER') return { success: false, error: 'मालिक सत्र नहीं मिला' };
    const owner = user as OwnerUser;
    try {
      const res = await fetch('/api/owner/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleNumber: owner.vehicleNumber,
          ownerName: data.ownerName,
          mobile: data.mobile,
          photoUrl: data.photoUrl,
        }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'अपडेट विफल' };
      }
      const updatedUser: OwnerUser = {
        ...owner,
        ...(data.ownerName ? { ownerName: data.ownerName } : {}),
        ...(data.mobile ? { mobile: data.mobile } : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
      };
      saveSession(updatedUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
    }
  };

  const refreshUser = () => {
    // re-fetch latest vehicle profile if owner
    if (user && user.role === 'OWNER') {
      const owner = user as OwnerUser;
      fetch(`/api/fleet/${owner.vehicleNumber}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.vehicle) {
            saveSession({
              ...owner,
              ownerName: d.vehicle.ownerName,
              membershipNumber: d.vehicle.membershipNumber,
            });
          }
        })
        .catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isLoading,
        loginAsOwner,
        verifyOwnerOtp,
        registerOwner,
        loginAsAdmin,
        updateOwnerProfile,
        logout,
        refreshUser,
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
