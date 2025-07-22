import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunks
export const fetchAdminData = createAsyncThunk(
  "admin/fetchAdminData",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch admin data");
    }
  }
);

export const fetchAllDoctors = createAsyncThunk(
  "admin/fetchAllDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch doctors");
    }
  }
);

export const fetchAllPatients = createAsyncThunk(
  "admin/fetchAllPatients",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch patients");
    }
  }
);

export const verifyDoctor = createAsyncThunk(
  "admin/verifyDoctor",
  async ({ doctorId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/verify-doctor/${doctorId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to verify doctor");
    }
  }
);

const initialState = {
  adminData: null,
  doctors: [],
  patients: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminData: (state) => {
      state.adminData = null;
      state.doctors = [];
      state.patients = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAdminData
      .addCase(fetchAdminData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.adminData = action.payload;
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetchAllDoctors
      .addCase(fetchAllDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetchAllPatients
      .addCase(fetchAllPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchAllPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle verifyDoctor
      .addCase(verifyDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyDoctor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.doctors.findIndex(doc => doc._id === action.payload._id);
        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
      })
      .addCase(verifyDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminData } = adminSlice.actions;

export default adminSlice.reducer; 