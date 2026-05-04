import { configureStore } from '@reduxjs/toolkit';
import giftsListReducer from './slices/giftsListSlice'
import filterListReducer from './slices/filterListSlice'
import userReducer from './slices/userSlice'
import indexListReducer from './slices/indexListSlice'

export const store = configureStore({
    reducer: {
        giftsList: giftsListReducer,
        filters: filterListReducer,
        user: userReducer,
        indexList: indexListReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
