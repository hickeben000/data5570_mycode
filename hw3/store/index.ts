import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import goalsReducer from './slices/goalsSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    goals: goalsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
