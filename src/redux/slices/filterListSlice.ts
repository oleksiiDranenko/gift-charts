import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterListInterface } from '@/interfaces/FilterListInterface';

const initialState: FilterListInterface = {
    currency: 'ton',
    sort: 'highFirst',
    sortBy: 'price',
    chosenGifts: []
}
  
const filterListSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<FilterListInterface>) => {
            return action.payload;
        },
    }
});

export const { setFilters } = filterListSlice.actions;
export default filterListSlice.reducer;