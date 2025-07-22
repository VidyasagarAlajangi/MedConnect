import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  console.log("Auth token check:", {
    hasToken: !!token,
    tokenLength: token?.length,
    localStorage: {
      hasToken: !!localStorage.getItem("token"),
      hasUser: !!localStorage.getItem("user")
    }
  });
  if (!token) {
    throw new Error("No authentication token found");
  }
  return token;
};

// Async thunk for login
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password, role }, { rejectWithValue }) => {
    console.log("Login attempt for:", { email, role });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
        role
      });

      console.log("Raw login response:", response);
      console.log("Login response data:", response.data);

      // Check if login was successful
      if (!response.data.success) {
        console.error("Login failed:", response.data.message);
        return rejectWithValue(response.data.message || "Login failed");
      }

      // Check if we have a token in the response
      if (!response.data.token) {
        console.error("No token in response:", response.data);
        return rejectWithValue("Login failed: No token received");
      }

      // Store token in localStorage
      const token = response.data.token;
      localStorage.setItem("token", token);
      console.log("Token stored in localStorage:", token);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Store user data in localStorage for persistence
      if (response.data.data) {
        const userData = {
          ...response.data.data,
          role: role // Ensure role is included
        };
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("User data stored in localStorage:", userData);
      } else {
        console.error("No user data in response:", response.data);
        return rejectWithValue("Login failed: No user data received");
      }

      // Return both token and user data
      return {
        token,
        user: {
          ...response.data.data,
          role: role
        }
      };
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Login failed"
      );
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    console.log("Logout attempt");
    try {
      const token = getAuthToken();
      console.log("Logout with token:", token ? "Token exists" : "No token");
      
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("Logout response:", response.data);
    } catch (error) {
      console.error("Logout error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      // Always clear local storage on logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("Local storage cleared on logout");
    }
  }
);

// Async thunk for initialization
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    console.log("Auth initialization started");
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      console.log("Auth initialization state:", {
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token?.length
      });

      // If we have both token and user data, try to use them
      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);
          console.log("Parsed user data:", {
            hasRole: !!parsedUser?.role,
            role: parsedUser?.role,
            userId: parsedUser?._id
          });

          if (parsedUser && parsedUser.role) {
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log("Auth initialization successful:", {
              hasToken: true,
              hasUser: true,
              userRole: parsedUser.role
            });
            return { user: parsedUser, token, isAuthenticated: true };
          }
        } catch (parseError) {
          console.error("Auth initialization error: Failed to parse user data", {
            error: parseError.message,
            userData: user
          });
          // If parsing fails, clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      // If we get here, either we had no data or it was invalid
      console.log("Auth initialization: No valid auth data found");
      return { user: null, token: null, isAuthenticated: false };
    } catch (error) {
      console.error("Auth initialization error:", {
        message: error.message,
        stack: error.stack
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common['Authorization'];
      throw rejectWithValue(error.message || "Failed to initialize auth state");
    }
  }
);

// Async thunk to verify token
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    console.log("Token verification started");
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.error("Token verification failed: No token found");
        throw new Error("No token found");
      }

      console.log("Verifying token with server");
      const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Token verification response:", {
        success: response.data?.success,
        hasUserData: !!response.data?.data,
        userRole: response.data?.data?.role
      });

      if (!response.data.data) {
        console.error("Token verification failed: No user data in response");
        throw new Error("No user data received during verification");
      }

      // Update user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.data));
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log("Token verification successful:", {
        userId: response.data.data._id,
        userRole: response.data.data.role,
        hasToken: true
      });

      return { user: response.data.data, token, isAuthenticated: true };
    } catch (error) {
      console.error("Token verification error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      // Clear invalid token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common['Authorization'];
      throw rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Token verification failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle initialization
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Handle login
      .addCase(login.pending, (state) => {
        console.log("Login pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("Login successful:", action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        
        // Ensure localStorage is updated
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
        
        console.log("State after login:", {
          hasUser: !!state.user,
          hasToken: !!state.token,
          isAuthenticated: state.isAuthenticated,
          loading: state.loading
        });
      })
      .addCase(login.rejected, (state, action) => {
        console.error("Login rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common['Authorization'];
      })
      // Handle logout
      .addCase(logout.fulfilled, (state) => {
        console.log("Logout successful");
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      // Handle token verification
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common['Authorization'];
      });
  }
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
