import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunk for fetching all doctors
export const fetchAllDoctors = createAsyncThunk(
  "doctorSearch/fetchAllDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/doctors`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch doctors");
    }
  }
);

const initialState = {
  doctors: [],
  filteredDoctors: [],
  filters: {
    search: "",
    specialization: "",
    minExperience: "",
    maxExperience: "",
    minRating: "",
    isActive: "",
    sortBy: "rating-high",
  },
  loading: false,
  error: null,
};

const doctorSearchSlice = createSlice({
  name: "doctorSearch",
  initialState,
  reducers: {
    addDoctors: (state, action) => {
      state.doctors = action.payload;
      state.filteredDoctors = filterDoctors(action.payload, state.filters);
    },
    updateFilter: (state, action) => {
      const { name, value } = action.payload;
      state.filters = {
        ...state.filters,
        [name]: value,
      };
      state.filteredDoctors = filterDoctors(state.doctors, state.filters);
    },
    applyFilters: (state) => {
      state.filteredDoctors = filterDoctors(state.doctors, state.filters);
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredDoctors = state.doctors ? [...state.doctors] : [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
        state.filteredDoctors = filterDoctors(action.payload, state.filters);
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Helper function to filter doctors
const filterDoctors = (doctors, filters) => {
  if (!doctors || !Array.isArray(doctors)) {
    return [];
  }

  let result = [...doctors];

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    result = result.filter(
      (doctor) =>
        doctor.name?.toLowerCase().includes(searchTerm) ||
        doctor.specialization?.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.specialization) {
    result = result.filter(
      (doctor) =>
        doctor.specialization?.toLowerCase() ===
        filters.specialization.toLowerCase()
    );
  }

  if (filters.minExperience) {
    const minExp = parseFloat(filters.minExperience);
    result = result.filter((doctor) => doctor.experience >= minExp);
  }

  if (filters.maxExperience) {
    const maxExp = parseFloat(filters.maxExperience);
    result = result.filter((doctor) => doctor.experience <= maxExp);
  }

  if (filters.minRating) {
    const minRating = parseFloat(filters.minRating);
    result = result.filter((doctor) => doctor.rating >= minRating);
  }

  if (filters.isActive !== "") {
    const isActiveValue = filters.isActive === "true";
    result = result.filter((doctor) => doctor.isActive === isActiveValue);
  }

  if (filters.sortBy === "rating-high") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (filters.sortBy === "rating-low") {
    result.sort((a, b) => a.rating - b.rating);
  } else if (filters.sortBy === "experience-high") {
    result.sort((a, b) => b.experience - a.experience);
  } else if (filters.sortBy === "experience-low") {
    result.sort((a, b) => a.experience - b.experience);
  }

  return result;
};

export const { addDoctors, updateFilter, applyFilters, resetFilters } =
  doctorSearchSlice.actions;

export default doctorSearchSlice.reducer; 