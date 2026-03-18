import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosInstance";

export const fetchPatientData = createAsyncThunk(
  "patient/fetchPatientData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/patients/profile");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch patient data");
    }
  }
);

export const fetchPatientAppointments = createAsyncThunk(
  "patient/fetchPatientAppointments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/appointment/my-appointments");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

export const fetchPatientMedicalHistory = createAsyncThunk(
  "patient/fetchPatientMedicalHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/patients/medical-history");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch medical history");
    }
  }
);

const initialState = {
  patientData: null,
  appointments: [],
  medicalHistory: [],
  loading: false,
  error: null,
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    setPatientData: (state, action) => {
      state.patientData = action.payload;
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
    addMedicalRecord: (state, action) => {
      state.medicalHistory.push(action.payload);
    },
    clearPatientData: (state) => {
      state.patientData = null;
      state.appointments = [];
      state.medicalHistory = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientData.fulfilled, (state, action) => {
        state.loading = false;
        state.patientData = action.payload;
      })
      .addCase(fetchPatientData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPatientAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchPatientAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPatientMedicalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.medicalHistory = action.payload;
      })
      .addCase(fetchPatientMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPatientData,
  addAppointment,
  updateAppointment,
  addMedicalRecord,
  clearPatientData,
} = patientSlice.actions;

export default patientSlice.reducer;
 