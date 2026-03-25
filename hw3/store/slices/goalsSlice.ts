import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export type Goal = {
  id: number;
  user: number;
  user_name: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  created_at: string;
};

type CreateGoalPayload = {
  user: number;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
};

type GoalsState = {
  items: Goal[];
  loading: boolean;
  creating: boolean;
  error: string | null;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

const initialState: GoalsState = {
  items: [],
  loading: false,
  creating: false,
  error: null,
};

export const fetchGoals = createAsyncThunk<Goal[]>('goals/fetchGoals', async () => {
  const response = await fetch(`${API_BASE_URL}/goals/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch goals (${response.status})`);
  }
  return (await response.json()) as Goal[];
});

export const createGoal = createAsyncThunk<Goal, CreateGoalPayload>(
  'goals/createGoal',
  async (payload) => {
    const response = await fetch(`${API_BASE_URL}/goals/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || `Failed to create goal (${response.status})`);
    }

    return (await response.json()) as Goal;
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch goals.';
      })
      .addCase(createGoal.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message ?? 'Failed to create goal.';
      });
  },
});

export default goalsSlice.reducer;
