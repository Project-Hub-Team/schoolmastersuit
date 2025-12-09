/**
 * Authentication Context Provider
 * Manages user authentication state and operations
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase.config';
import { getUser, createUser } from '../utils/database';
import { USER_ROLES } from '../constants/ghanaEducation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // AUTHENTICATION FUNCTIONS
  // ============================================

  /**
   * Register new user
   */
  const register = async (email, password, userData) => {
    try {
      setError(null);
      
      // Create Firebase auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        });
      }
      
      // Create user profile in database
      const profileData = {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || '',
        role: userData.role || USER_ROLES.STUDENT,
        ...userData,
        createdAt: Date.now(),
        lastLogin: Date.now()
      };
      
      await createUser(user.uid, profileData);
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      const userProfile = await getUser(userCredential.user.uid);
      if (userProfile.success) {
        // Update last login timestamp
        await createUser(userCredential.user.uid, {
          ...userProfile.data,
          lastLogin: Date.now()
        });
      }
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      
      if (currentUser) {
        // Update Firebase Auth profile
        if (updates.displayName || updates.photoURL) {
          await updateProfile(currentUser, {
            displayName: updates.displayName || currentUser.displayName,
            photoURL: updates.photoURL || currentUser.photoURL
          });
        }
        
        // Update database profile
        const result = await getUser(currentUser.uid);
        if (result.success) {
          await createUser(currentUser.uid, {
            ...result.data,
            ...updates,
            updatedAt: Date.now()
          });
          
          setUserProfile({
            ...userProfile,
            ...updates
          });
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // ROLE-BASED CHECKS
  // ============================================

  const isSuperAdmin = () => userProfile?.role === USER_ROLES.SUPER_ADMIN;
  const isAdmin = () => userProfile?.role === USER_ROLES.ADMIN;
  const isTeacher = () => userProfile?.role === USER_ROLES.TEACHER;
  const isStudent = () => userProfile?.role === USER_ROLES.STUDENT;
  const isParent = () => userProfile?.role === USER_ROLES.PARENT;

  const hasRole = (role) => userProfile?.role === role;
  const hasAnyRole = (roles) => roles.includes(userProfile?.role);

  // ============================================
  // EFFECT: MONITOR AUTH STATE
  // ============================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from database
        const result = await getUser(user.uid);
        if (result.success) {
          setUserProfile(result.data);
        } else {
          console.error('Failed to fetch user profile');
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    isSuperAdmin,
    isAdmin,
    isTeacher,
    isStudent,
    isParent,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
