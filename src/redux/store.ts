import { configureStore } from '@reduxjs/toolkit';
import giftsListReducer from './slices/giftsListSlice'
import filterListReducer from './slices/filterListSlice'
import userReducer from './slices/userSlice'
import subscriptionReducer from './slices/subscriptionSlice'
import indexListReducer from './slices/indexListSlice'

export const store = configureStore({
    reducer: {
        giftsList: giftsListReducer,
        filters: filterListReducer,
        user: userReducer,
        subscription: subscriptionReducer,
        indexList: indexListReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
