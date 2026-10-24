import ingredientsReducer, { fetchIngredients } from '../ingredients-slice';

import type { TIngredient } from '@utils-types';

const bun: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
};

const main: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
};

const initialState = {
  ingredients: [],
  isLoading: false,
  error: null,
};

describe('ingredients reducer', () => {
  it('returns initial state for unknown action when state is undefined', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  it('returns the same state for unknown action', () => {
    const currentState = { ...initialState, ingredients: [bun] };

    const state = ingredientsReducer(currentState, { type: 'UNKNOWN' });

    expect(state).toBe(currentState);
  });

  describe('fetchIngredients', () => {
    it('sets loading flag and clears error on pending', () => {
      const currentState = {
        ...initialState,
        error: { message: 'Прошлая ошибка' },
      };

      const state = ingredientsReducer(currentState, fetchIngredients.pending('id'));

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('saves ingredients and resets loading flag on fulfilled', () => {
      const loadingState = { ...initialState, isLoading: true };

      const state = ingredientsReducer(
        loadingState,
        fetchIngredients.fulfilled([bun, main], 'id')
      );

      expect(state.isLoading).toBe(false);
      expect(state.ingredients).toEqual([bun, main]);
      expect(state.error).toBeNull();
    });

    it('saves error and resets loading flag on rejected', () => {
      const loadingState = { ...initialState, isLoading: true };

      const state = ingredientsReducer(
        loadingState,
        fetchIngredients.rejected(new Error('Ошибка сети'), 'id')
      );

      expect(state.isLoading).toBe(false);
      expect(state.error?.message).toBe('Ошибка сети');
      expect(state.ingredients).toEqual([]);
    });

    it('keeps loaded ingredients when a repeated request fails', () => {
      const loadedState = { ...initialState, ingredients: [bun] };

      const state = ingredientsReducer(
        loadedState,
        fetchIngredients.rejected(new Error('Ошибка сети'), 'id')
      );

      expect(state.ingredients).toEqual([bun]);
    });
  });
});
