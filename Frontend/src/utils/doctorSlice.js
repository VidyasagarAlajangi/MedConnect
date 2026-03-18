import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosInstance";

export const fetchDoctorData = createAsyncThunk(
  "doctor/fetchDoctorData",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      if (state.doctor.doctorData && !state.doctor.isStale) {
        return state.doctor.doctorData;
      }

      const response = await axiosInstance.get("/api/doctors/get-doctor-profile");

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
      const response = await axiosInstance.get("/api/doctors/my-appointments");
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch appointments");
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

export const fetchDoctorPatients = createAsyncThunk(
  "doctor/fetchDoctorPatients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/doctors/my-patients");
      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch patients");
      }
      return response.data.patients;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch patients");
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  "doctor/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        "/api/doctors/update-profile",
        profileData
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

export const updateDoctorAvailability = createAsyncThunk(
  "doctor/updateAvailability",
  async (availability, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        "/api/doctors/update-availability",
        { availability }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to update availability");
      }

      return response.data.data || response.data.doctor;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update availability");
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
      })
      .addCase(updateDoctorAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorAvailability.fulfilled, (state, action) => {
        state.loading = false;
        if (state.doctorData) {
          if (action.payload.availableSlots) {
             state.doctorData.availableSlots = action.payload.availableSlots;
          }
        }
        state.isStale = false;
        state.lastFetched = Date.now();
      })
      .addCase(updateDoctorAvailability.rejected, (state, action) => {
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
