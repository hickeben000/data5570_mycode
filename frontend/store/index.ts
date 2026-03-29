import { configureStore } from '@reduxjs/toolkit';
import goalsReducer from './slices/goalsSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    goals: goalsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
