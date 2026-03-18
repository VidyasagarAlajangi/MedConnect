import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosInstance";

// Async thunks
export const fetchAdminData = createAsyncThunk(
  "admin/fetchAdminData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/admin/profile");
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
      const response = await axiosInstance.get("/api/admin/doctors");
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
      const response = await axiosInstance.get("/api/admin/patients");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch patients");
    }
  }
);

export const verifyDoctor = createAsyncThunk(
  "admin/verifyDoctor",
  async ({ doctorId, action }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/verify-doctor/${doctorId}`,
        { action }
      );
      return { doctorId, action, doctor: response.data.doctor };
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
        const { doctorId, action: verifyAction, doctor } = action.payload;
        if (verifyAction === 'reject') {
          // Remove rejected doctor from list
          state.doctors = state.doctors.filter(doc => doc._id !== doctorId);
        } else if (doctor) {
          // Update approved doctor in list
          const index = state.doctors.findIndex(doc => doc._id === doctor._id);
          if (index !== -1) {
            state.doctors[index] = doctor;
          }
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
 