import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosInstance";

// Async thunk for login
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email,
        password,
        role,
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Login failed");
      }

      const { token, data } = response.data;
      
      // Persistence handled by redux-persist primarily, 
      // but we keep localStorage for axios interceptor and legacy support
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ ...data, role }));

      return {
        token,
        user: { ...data, role },
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.get("/api/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
);

// Async thunk for patient registration
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/auth/register", userData);
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Registration failed");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  }
);

// Async thunk for doctor registration (handles FormData for photo)
export const registerDoctor = createAsyncThunk(
  "auth/registerDoctor",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/auth/register-doctor", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Doctor registration failed");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Doctor registration failed"
      );
    }
  }
);

// Async thunk for initialization (checks local storage as a fallback to persist)
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        return { user: parsedUser, token, isAuthenticated: true };
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return { user: null, token: null, isAuthenticated: false };
  }
);

// Async thunk to verify token
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/auth/verify");

      if (!response.data.success || !response.data.data) {
        throw new Error("Verification failed");
      }

      localStorage.setItem("user", JSON.stringify(response.data.data));
      return { user: response.data.data, isAuthenticated: true };
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return rejectWithValue(
        error.response?.data?.message || "Token verification failed"
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
    // Only show loading if we have a token to verify; otherwise show immediately
    loading: !!localStorage.getItem("token"),
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
