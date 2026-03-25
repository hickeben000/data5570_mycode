import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export type AppUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
};

type CreateUserPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
};

type UsersState = {
  items: AppUser[];
  loading: boolean;
  creating: boolean;
  error: string | null;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

const initialState: UsersState = {
  items: [],
  loading: false,
  creating: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<AppUser[]>('users/fetchUsers', async () => {
  const response = await fetch(`${API_BASE_URL}/users/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch users (${response.status})`);
  }
  return (await response.json()) as AppUser[];
});

export const createUser = createAsyncThunk<AppUser, CreateUserPayload>(
  'users/createUser',
  async (payload) => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        phone_number: payload.phone_number?.trim() || null,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || `Failed to create user (${response.status})`);
    }

    return (await response.json()) as AppUser;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch users.';
      })
      .addCase(createUser.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createUser.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message ?? 'Failed to create user.';
      });
  },
});

export default usersSlice.reducer;
