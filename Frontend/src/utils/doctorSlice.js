import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunks
export const fetchDoctorData = createAsyncThunk(
  "doctor/fetchDoctorData",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if we already have the data and it's not stale
      const state = getState();
      if (state.doctor.doctorData && !state.doctor.isStale) {
        return state.doctor.doctorData;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${API_BASE_URL}/api/doctors/get-doctor-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch doctor data");
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch doctor data");
    }
  }
);

export const fetchDoctorAppointments = createAsyncThunk(
  "doctor/fetchDoctorAppointments",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/doctors/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

export const fetchDoctorPatients = createAsyncThunk(
  "doctor/fetchDoctorPatients",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/doctors/my-patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch patients");
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  "doctor/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/doctors/update-profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to update profile");
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

const initialState = {
  doctorData: null,
  appointments: [],
  patients: [],
  loading: false,
  error: null,
  isStale: true,
  lastFetched: null
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setDoctorData: (state, action) => {
      state.doctorData = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex(apt => apt._id === action.payload._id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    addPatient: (state, action) => {
      state.patients.push(action.payload);
    },
    clearDoctorData: (state) => {
      state.doctorData = null;
      state.appointments = [];
      state.patients = [];
      state.error = null;
      state.isStale = true;
      state.lastFetched = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    markAsStale: (state) => {
      state.isStale = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchDoctorData
      .addCase(fetchDoctorData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorData.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorData = action.payload;
        state.isStale = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDoctorData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isStale = true;
      })
      // Handle fetchDoctorAppointments
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetchDoctorPatients
      .addCase(fetchDoctorPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchDoctorPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle updateDoctorProfile
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorData = action.payload;
        state.isStale = false;
        state.lastFetched = Date.now();
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDoctorData,
  addAppointment,
  updateAppointment,
  addPatient,
  clearDoctorData,
  clearError,
  markAsStale
} = doctorSlice.actions;

export default doctorSlice.reducer;
