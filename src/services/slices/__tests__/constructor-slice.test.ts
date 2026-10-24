import constructorReducer, {
  addIngredient,
  moveIngredient,
  removeIngredient,
} from '../constructor-slice';
import { createOrder } from '../order-slice';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const bun: TIngredient = {
  _id: 'bun-1',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'bun-1.png',
  image_large: 'bun-1-large.png',
  image_mobile: 'bun-1-mobile.png',
};

const anotherBun: TIngredient = {
  ...bun,
  _id: 'bun-2',
  name: 'Флюоресцентная булка R2-D3',
};

const main: TIngredient = {
  _id: 'main-1',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'main-1.png',
  image_large: 'main-1-large.png',
  image_mobile: 'main-1-mobile.png',
};

const sauce: TIngredient = {
  ...main,
  _id: 'sauce-1',
  name: 'Соус Spicy-X',
  type: 'sauce',
};

const withId = (ingredient: TIngredient, id: string): TConstructorIngredient => ({
  ...ingredient,
  id,
});

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

describe('burgerConstructor reducer', () => {
  it('returns initial state for unknown action when state is undefined', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  describe('addIngredient', () => {
    it('puts a bun into the bun slot', () => {
      const state = constructorReducer(initialState, addIngredient(bun));

      expect(state.bun).toMatchObject(bun);
      expect(state.ingredients).toEqual([]);
    });

    it('replaces the bun when another one is added', () => {
      const withBun = constructorReducer(initialState, addIngredient(bun));

      const state = constructorReducer(withBun, addIngredient(anotherBun));

      expect(state.bun).toMatchObject(anotherBun);
    });

    it('appends fillings and sauces to the ingredients list', () => {
      const withMain = constructorReducer(initialState, addIngredient(main));

      const state = constructorReducer(withMain, addIngredient(sauce));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0]).toMatchObject(main);
      expect(state.ingredients[1]).toMatchObject(sauce);
    });

    it('gives every added ingredient a unique id', () => {
      const firstState = constructorReducer(initialState, addIngredient(main));

      const state = constructorReducer(firstState, addIngredient(main));

      expect(state.ingredients[0].id).toBeTruthy();
      expect(state.ingredients[0].id).not.toBe(state.ingredients[1].id);
    });
  });

  describe('removeIngredient', () => {
    const currentState: TConstructorState = {
      bun: withId(bun, 'bun-id'),
      ingredients: [withId(main, 'main-id'), withId(sauce, 'sauce-id')],
    };

    it('removes the ingredient with the given id', () => {
      const state = constructorReducer(currentState, removeIngredient('main-id'));

      expect(state.ingredients).toEqual([withId(sauce, 'sauce-id')]);
    });

    it('does not touch the bun', () => {
      const state = constructorReducer(currentState, removeIngredient('main-id'));

      expect(state.bun).toEqual(currentState.bun);
    });

    it('ignores an unknown id', () => {
      const state = constructorReducer(currentState, removeIngredient('missing-id'));

      expect(state.ingredients).toEqual(currentState.ingredients);
    });
  });

  describe('moveIngredient', () => {
    const first = withId(main, 'first');
    const second = withId(sauce, 'second');
    const third = withId(main, 'third');
    const currentState: TConstructorState = {
      bun: null,
      ingredients: [first, second, third],
    };

    it('moves the ingredient down', () => {
      const state = constructorReducer(
        currentState,
        moveIngredient({ index: 0, offset: 1 })
      );

      expect(state.ingredients).toEqual([second, first, third]);
    });

    it('moves the ingredient up', () => {
      const state = constructorReducer(
        currentState,
        moveIngredient({ index: 2, offset: -1 })
      );

      expect(state.ingredients).toEqual([first, third, second]);
    });

    it('does not move the first ingredient up', () => {
      const state = constructorReducer(
        currentState,
        moveIngredient({ index: 0, offset: -1 })
      );

      expect(state.ingredients).toEqual(currentState.ingredients);
    });

    it('does not move the last ingredient down', () => {
      const state = constructorReducer(
        currentState,
        moveIngredient({ index: 2, offset: 1 })
      );

      expect(state.ingredients).toEqual(currentState.ingredients);
    });
  });

  describe('createOrder', () => {
    const filledState: TConstructorState = {
      bun: withId(bun, 'bun-id'),
      ingredients: [withId(main, 'main-id')],
    };
    const order = {
      _id: 'order-id',
      status: 'done',
      name: 'Краторный бургер',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      number: 12345,
      ingredients: [bun._id, main._id, bun._id],
    };

    it('keeps the burger while the order is being created', () => {
      const state = constructorReducer(filledState, createOrder.pending('id', []));

      expect(state).toEqual(filledState);
    });

    it('clears the constructor when the order is created', () => {
      const state = constructorReducer(
        filledState,
        createOrder.fulfilled(order, 'id', [])
      );

      expect(state).toEqual(initialState);
    });

    it('keeps the burger when the order creation fails', () => {
      const state = constructorReducer(
        filledState,
        createOrder.rejected(new Error('Ошибка'), 'id', [])
      );

      expect(state).toEqual(filledState);
    });
  });
});
