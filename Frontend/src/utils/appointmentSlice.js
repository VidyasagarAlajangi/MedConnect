import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosInstance";

export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAppointments",
  async (date, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "/api/appointment/doctor-appointments",
        {
          params: { date },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to fetch appointments");
      }

      return response.data.data;
    } catch (error) {
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

      let response;
      if (status === "confirmed") {
        response = await axiosInstance.patch(
          `/api/appointment/confirm/${appointmentId}`,
          {}
        );
      } else {
        response = await axiosInstance.put(
          `/api/appointment/doctor-cancel/${appointmentId}`,
          {}
        );
      }

      if (!response.data.success && response.data.message) {
        return rejectWithValue(response.data.message || "Failed to update appointment status");
      }

      return response.data.data;
    } catch (error) {
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
 