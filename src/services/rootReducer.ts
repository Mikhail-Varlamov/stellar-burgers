import { combineReducers } from '@reduxjs/toolkit';

import burgerConstructor from './slices/constructor-slice';
import feed from './slices/feed-slice';
import ingredients from './slices/ingredients-slice';
import order from './slices/order-slice';
import profileOrders from './slices/profile-orders-slice';
import user from './slices/user-slice';

export const rootReducer = combineReducers({
  ingredients,
  burgerConstructor,
  order,
  feed,
  profileOrders,
  user,
});
