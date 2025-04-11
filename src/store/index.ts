import { configureStore } from "@reduxjs/toolkit";
import resourcesReducer from "./slices/resourcesSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    resources: resourcesReducer,
    user: userReducer,
  },
  // Add middleware or other store enhancers here if needed
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
