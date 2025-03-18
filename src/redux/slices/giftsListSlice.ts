import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import GiftInterface from '@/interfaces/GiftInterface';

const initialState: GiftInterface[] = []
  
const giftsListSlice = createSlice({
    name: 'giftsList',
    initialState,
    reducers: {
        setGiftsList: (state, action: PayloadAction<GiftInterface[]>) => {
            return action.payload;
        },
    }
});

export const { setGiftsList } = giftsListSlice.actions;
export default giftsListSlice.reducer;