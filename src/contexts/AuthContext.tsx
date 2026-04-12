import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_BASE, profilePhotoSrc } from '../config/apiBase';

export interface User {
  id: string;
  email: string;
  fullName: string;
  pronouns?: string;
  phone?: string;
  hobbies: string[];
  skills: string[];
  profilePhoto?: string;
}

export type SignupResult =
  | { success: true }
  | { success: false; error: string };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<SignupResult>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<boolean>;
  deleteProfilePhoto: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapApiUser(apiUser: any): User {
  // map backend user shape to frontend shape
  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.full_name || '',
    hobbies: apiUser.hobbies || [],
    skills: apiUser.skills || [],
    profilePhoto: profilePhotoSrc(apiUser.profile_photo_path) || '',
    // optional fields can be missing from backend
    pronouns: apiUser.pronouns || '',
    phone: apiUser.phone || '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // load current session user
  useEffect(() => {
    const loadSessionUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        setUser(mapApiUser(data.user));
      } catch {
        // keep ui usable if backend is down
      }
    };
    loadSessionUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // call backend login and set active user
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(mapApiUser(data.user));
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<SignupResult> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      let data: { user?: unknown; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // non-json body
      }
      if (!res.ok) {
        const msg =
          typeof data.error === 'string' && data.error.trim()
            ? data.error
            : 'Registration failed. Please try again.';
        return { success: false, error: msg };
      }
      setUser(mapApiUser(data.user));
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Could not reach the server. Check that the API is running and try again.',
      };
    }
  };

  const logout = () => {
    // end backend session
    fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // ignore errors and clear local ui state
    });
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    // send allowed profile fields to backend
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: updates.fullName,
          bio: (updates as any).bio,
          hobbies: updates.hobbies,
          skills: updates.skills,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setUser(mapApiUser(data.profile));
    } catch {
      // keep old state if request fails
    }
  };

  const uploadProfilePhoto = async (file: File): Promise<boolean> => {
    if (!user) return false;
    const body = new FormData();
    body.append('photo', file);
    try {
      const res = await fetch(`${API_BASE}/profile/photo`, {
        method: 'POST',
        body,
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(mapApiUser(data.profile));
      return true;
    } catch {
      return false;
    }
  };

  const deleteProfilePhoto = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/profile/photo`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(mapApiUser(data.profile));
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
        uploadProfilePhoto,
        deleteProfilePhoto,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
