import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function mapApiUser(apiUser: any): User {
  // map backend user shape to frontend shape
  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.full_name || '',
    hobbies: apiUser.hobbies || [],
    skills: apiUser.skills || [],
    profilePhoto: apiUser.profile_photo_path || '',
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

  const signup = async (email: string, password: string): Promise<boolean> => {
    // call backend register and set active user
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
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
