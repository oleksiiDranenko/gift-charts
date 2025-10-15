import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserInterface } from "@/interfaces/UserInterface";

const initialState: UserInterface = {
  _id: "",
  telegramId: "",
  token: "",
  username: "",
  savedList: [],
  assets: [],
  ton: 0,
  usd: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserInterface>) => {
      return action.payload;
    },
    setDefaultUser: () => initialState,
  },
});

export const { setUser, setDefaultUser } = userSlice.actions;
export default userSlice.reducer;
