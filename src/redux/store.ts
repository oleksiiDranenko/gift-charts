import { configureStore } from '@reduxjs/toolkit';
import giftsListReducer from './slices/giftsListSlice'
import filterListReducer from './slices/filterListSlice'

export const store = configureStore({
    reducer: {
        giftsList: giftsListReducer,
        filters: filterListReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
