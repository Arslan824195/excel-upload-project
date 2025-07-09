import { combineReducers } from '@reduxjs/toolkit';
import userReducer from '../store/slices/user';

const rootReducer = combineReducers({
  user: userReducer
});

export default rootReducer;