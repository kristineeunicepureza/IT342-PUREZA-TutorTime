import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, RegisterRequest } from '../services/authService';
import { getMyProfile, updateMyProfile, changePassword as changePw, UpdateProfilePayload, ChangePasswordPayload, UserProfile } from '../services/profileService';

export type UserRole = 'STUDENT' | 'TUTOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleInitial?: string;
  role: UserRole;
  profilePhotoUrl?: string;
  // tutor-only
  bio?: string;
  expertise?: string;
  subjects?: string;
  location?: string;
  rating?: number;
}

interface AppContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  login:          (email: string, password: string) => Promise<boolean>;
  signup:         (data: RegisterRequest) => Promise<boolean>;
  logout:         () => Promise<void>;
  clearError:     () => void;
  updateProfile:  (payload: UpdateProfilePayload) => Promise<boolean>;
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

// ─── Convert UserProfile DTO → User ──────────────────────────────────────
function toUser(p: UserProfile): User {
  return {
    id:              p.id,
    email:           p.email,
    firstName:       p.firstName,
    lastName:        p.lastName,
    middleInitial:   p.middleInitial,
    role:            p.role,
    profilePhotoUrl: p.profilePhotoUrl,
    bio:             p.bio,
    expertise:       p.expertise,
    subjects:        p.subjects,
    location:        p.location,
    rating:          p.rating,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // ── Persist user in localStorage ─────────────────────────────────────────
  const saveUser = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  }, []);

  // ── Restore session on mount (token + server verify) ─────────────────────
  useEffect(() => {
    const token   = authService.getToken();
    const stored  = localStorage.getItem('user');

    if (!token || !stored) return;

    // Immediately show stored user (instant UI), then refresh from server
    try {
      const parsed = JSON.parse(stored) as User;
      setCurrentUser(parsed);
    } catch { /* corrupt cache */ }

    // Re-fetch fresh profile to ensure consistency after refresh
    getMyProfile()
      .then(profile => saveUser(toUser(profile)))
      .catch(() => {
        // Token expired – clear session
        setCurrentUser(null);
        authService.removeToken();
        localStorage.removeItem('user');
      });
  }, [saveUser]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login({ email, password });
      authService.setToken(res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      // Fetch full profile (includes tutor fields)
      const profile = await getMyProfile();
      saveUser(toUser(profile));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Signup ────────────────────────────────────────────────────────────────
  const signup = async (data: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.register(data);
      authService.setToken(res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      const profile = await getMyProfile();
      saveUser(toUser(profile));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try { await authService.logout(); } catch { /* best-effort */ }
    setCurrentUser(null);
    authService.removeToken();
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    setError(null);
  };

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = async (payload: UpdateProfilePayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateMyProfile(payload);
      saveUser(toUser(updated));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = async (payload: ChangePasswordPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await changePw(payload);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Refresh profile from server ───────────────────────────────────────────
  const refreshProfile = async () => {
    try {
      const profile = await getMyProfile();
      saveUser(toUser(profile));
    } catch { /* silent */ }
  };

  const clearError = () => setError(null);

  return (
    <AppContext.Provider value={{
      currentUser, isLoading, error,
      login, signup, logout, clearError,
      updateProfile, changePassword, refreshProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
};