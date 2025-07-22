import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return token;
};

// Set up axios interceptor for token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Set up axios interceptor for response
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Async thunks with improved error handling
export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAppointments",
  async (date, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      
      const response = await axios.get(
        `${API_BASE_URL}/api/appointment/doctor-appointments`,
        {
          params: { date },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch appointments");
      }

      return response.data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue("Session expired. Please login again.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  "appointments/updateStatus",
  async ({ appointmentId, status }, { rejectWithValue }) => {
    try {
      if (!appointmentId) {
        return rejectWithValue("Invalid appointment ID");
      }

      const token = getAuthToken();
      const endpoint = status === "confirmed" ? "confirm" : "cancel";

      const response = await axios.put(
        `${API_BASE_URL}/api/appointment/${endpoint}/${appointmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to update appointment status");
      }

      return response.data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue("Session expired. Please login again.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to update appointment status");
    }
  }
);

const initialState = {
  appointments: [],
  loading: false,
  error: null,
  lastUpdated: null
};

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    clearAppointments: (state) => {
      state.appointments = [];
      state.error = null;
      state.lastUpdated = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAppointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload === "Session expired. Please login again.") {
          state.appointments = [];
          state.lastUpdated = null;
        }
      })
      // Handle updateAppointmentStatus
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(
          (app) => app._id === action.payload._id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
          state.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload === "Session expired. Please login again.") {
          state.appointments = [];
          state.lastUpdated = null;
        }
      });
  },
});

export const { clearAppointments, clearError } = appointmentSlice.actions;
export default appointmentSlice.reducer; 