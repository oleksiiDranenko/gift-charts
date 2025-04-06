import SubscriptionInterface from '@/interfaces/SubscriptionInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: SubscriptionInterface = {
    _id: '',
    walletId: '',
    createdAt: new Date(0),
}
  
const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        setSubscription: (state, action: PayloadAction<SubscriptionInterface>) => {
            return action.payload;
        },
        setDefaultSubscription: () => initialState
    }
});

export const { setSubscription, setDefaultSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;