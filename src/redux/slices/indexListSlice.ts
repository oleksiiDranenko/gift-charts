import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IndexInterface } from '@/interfaces/IndexInterface';

const initialState: IndexInterface[] = []
  
const indexListSlice = createSlice({
    name: 'giftsList',
    initialState,
    reducers: {
        setIndexList: (state, action: PayloadAction<IndexInterface[]>) => {
            return action.payload;
        },
    }
});

export const { setIndexList } = indexListSlice.actions;
export default indexListSlice.reducer;