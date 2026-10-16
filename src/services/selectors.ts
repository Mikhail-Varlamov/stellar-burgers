import type { RootState } from './store';
import type { SerializedError } from '@reduxjs/toolkit';
import type {
  TConstructorState,
  TFeedState,
  TIngredient,
  TOrder,
  TUser,
} from '@utils-types';

export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.ingredients;

export const selectIngredientsLoading = (state: RootState): boolean =>
  state.ingredients.isLoading;

export const selectIngredientsError = (state: RootState): SerializedError | null =>
  state.ingredients.error;

export const selectConstructorItems = (state: RootState): TConstructorState =>
  state.burgerConstructor;

export const selectOrderRequest = (state: RootState): boolean =>
  state.order.orderRequest;

export const selectOrderModalData = (state: RootState): TOrder | null =>
  state.order.orderModalData;

export const selectViewedOrder = (state: RootState): TOrder | null =>
  state.order.viewedOrder;

export const selectFeed = (state: RootState): TFeedState => state.feed;

export const selectFeedOrders = (state: RootState): TOrder[] => state.feed.orders;

export const selectProfileOrders = (state: RootState): TOrder[] =>
  state.profileOrders.orders;

export const selectProfileOrdersLoading = (state: RootState): boolean =>
  state.profileOrders.isLoading;

export const selectUser = (state: RootState): TUser | null => state.user.user;

export const selectIsAuthChecked = (state: RootState): boolean =>
  state.user.isAuthChecked;

export const selectAuthError = (state: RootState): string | null => state.user.authError;

export const selectUpdateUserError = (state: RootState): string | null =>
  state.user.updateUserError;
