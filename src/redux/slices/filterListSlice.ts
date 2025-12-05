import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FilterListInterface } from "@/interfaces/FilterListInterface";

const initialState: FilterListInterface = {
  currency: "ton",
  sort: "highFirst",
  chosenGifts: [],
};

const filterListSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<FilterListInterface>) => {
      return action.payload;
    },
    setDefaultFilters: () => initialState,

    toggleGiftInFilter: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.chosenGifts.includes(id)) {
        state.chosenGifts = state.chosenGifts.filter((gid) => gid !== id);
      } else {
        state.chosenGifts.push(id);
      }
    },
  },
});

export const { setFilters, setDefaultFilters, toggleGiftInFilter } =
  filterListSlice.actions;

export default filterListSlice.reducer;
