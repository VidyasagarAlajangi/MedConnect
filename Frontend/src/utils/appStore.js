import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from "./authSlice";
import doctorReducer from "./doctorSlice";
import patientReducer from "./patientSlice";
import adminReducer from "./adminSlice";
import doctorSearchReducer from './doctorSearchSlice';
import appointmentReducer from './appointmentSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  doctor: doctorReducer,
  patient: patientReducer,
  admin: adminReducer,
  doctorSearch: doctorSearchReducer,
  appointments: appointmentReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
