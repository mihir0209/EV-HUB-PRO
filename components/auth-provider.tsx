"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider, // Correctly importing the CLASS
  type User,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { auth } from "@/lib/firebase"; // <<< Added Import for initialized auth instance
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  error: null,
  clearError: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // Start loading true for initial check
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Set persistence (run once)
  useEffect(() => {
    // Ensure auth is initialized before calling setPersistence
    // This assumes 'auth' from @/lib/firebase is ready immediately
    setPersistence(auth, browserLocalPersistence)
        .catch((error) => {
            console.error("Error setting persistence:", error)
            // Optionally set an error state here if persistence failure is critical
        });
  }, []) // Empty dependency array ensures this runs only once on mount

  // Listener for auth state changes
  useEffect(() => {
    setLoading(true); // Set loading true when the listener might change the user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // Set loading false once user state is determined
    });

    // Cleanup function
    return () => unsubscribe();
  }, []); // Empty dependency array, listener attaches once

  const clearError = () => setError(null)

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    clearError();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect on successful login
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(error.message || "Failed to sign in. Please try again.");
      }
      // No throw needed, error state handles feedback
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    clearError();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect on successful signup
    } catch (error: any) {
      console.error("Sign up error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use. Please use a different email or sign in.");
      } else {
        setError(error.message || "Failed to create account. Please try again.");
      }
      // No throw needed
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    clearError();
    // --- FIX: Instantiate the provider ---
    const provider = new GoogleAuthProvider();
    try {
       // --- Use the instantiated provider ---
      await signInWithPopup(auth, provider);
      router.push('/'); // Redirect on successful login
    } catch (error: any) {
      console.error("Google sign in error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        // Optionally do nothing or set a specific state, maybe not an "error"
        console.log("Google Sign-in popup closed by user.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
         setError('An account already exists with this email address using a different sign-in method.');
      }
       else {
        setError(error.message || "Failed to sign in with Google. Please try again.");
      }
      // No throw needed
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    clearError();
    try {
      await signOut(auth);
      // onAuthStateChanged will handle setting user to null
      router.push("/login"); // Redirect to login page after logout
    } catch (error: any) {
      console.error("Logout error:", error);
      setError(error.message || "Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare the context value
  const contextValue = {
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      logout,
      error,
      clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* You might want to show a loading indicator globally while loading is true */}
      {/* {!loading ? children : <div>Loading...</div>} */}
      {children}
    </AuthContext.Provider>
  );
}