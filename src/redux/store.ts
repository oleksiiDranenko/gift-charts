import { configureStore } from '@reduxjs/toolkit';
import giftsListReducer from './slices/giftsListSlice'

export const store = configureStore({
    reducer: {
        giftsList: giftsListReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
