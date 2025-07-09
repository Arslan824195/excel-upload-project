import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  name: null,
  email: null,
  role: null,
  login: null
};

const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { id, name, email, role, login } = action.payload;
      state.id = id;
      state.name = name;
      state.email = email;
      state.role = role;
      state.login = login;
    },
    resetUser: (state) => {
      Object.assign(state, initialState);
    }
  }
});

export const { setUser, resetUser } = user.actions;
export default user.reducer;