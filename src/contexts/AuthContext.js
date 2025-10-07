'use client'
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// API base URL - using Next.js API routes
const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { data: session, status } = useSession();

  // Sync NextAuth session with our auth context
  useEffect(() => {
    if (status === 'loading') {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Update our auth context with NextAuth session
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { 
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            provider: session.user.provider,
            profilePicture: session.user.image
          },
          token: 'nextauth-session' // Placeholder since NextAuth handles tokens
        }
      });
    } else if (status === 'unauthenticated') {
      // Check for existing local token for backwards compatibility
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token }
          });
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    }
    
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
  }, [session, status]);

  // Login function
  const login = async (username, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const loginUrl = `${API_BASE_URL}/api/auth/login`;

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.msg || data.error || 'Login failed';
        throw new Error(errorMsg);
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.data.user,
          token: data.data.token
        }
      });
      return { success: true, data: data.data };
    } catch (error) {
      console.error('=== Client Login Error ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // If using NextAuth session, use NextAuth signOut
      if (session) {
        await signOut({ callbackUrl: '/auth/auth1/login' });
      } else {
        // Call logout API if local token exists
        if (state.token && state.token !== 'nextauth-session') {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${state.token}`,
              'Content-Type': 'application/json',
            },
          });
        }
        
        // Clear local storage and state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear local state anyway
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.data.user,
          token: data.data.token
        }
      });

      return { success: true, data: data.data };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Get current user function
  const getCurrentUser = async () => {
    try {
      if (!state.token) return null;

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to get user');
      }

      return data.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      // If token is invalid, logout user
      logout();
      return null;
    }
  };

  // Authenticated fetch function
  const authenticatedFetch = async (url, options = {}) => {
    let token = state.token;
    
    // For NextAuth sessions, we don't use a token but rely on cookies
    if (session && state.token === 'nextauth-session') {
      // NextAuth handles authentication via cookies, no need for explicit token
      const config = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      
      // If unauthorized, logout user
      if (response.status === 401) {
        logout();
        throw new Error('Authentication failed');
      }

      return response;
    } else {
      // Use traditional token-based auth for local accounts
      if (!token || token === 'nextauth-session') {
        throw new Error('No authentication token available');
      }

      const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const config = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      
      // If unauthorized, logout user
      if (response.status === 401) {
        logout();
        throw new Error('Authentication failed');
      }

      return response;
    }
  };

  const value = {
    ...state,
    login,
    logout,
    register,
    clearError,
    getCurrentUser,
    authenticatedFetch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;