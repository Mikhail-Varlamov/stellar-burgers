import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:4000';
const INGREDIENTS_HAR = 'tests/hars/ingredients.har';
const USER_HAR = 'tests/hars/user.har';
const ORDER_HAR = 'tests/hars/order.har';

const BUN = {
  id: '6acd6b8163765e371c0bd9eb',
  name: 'Краторная булка N-200i',
  price: 1255,
  calories: 420,
};
const ANOTHER_BUN = { name: 'Флюоресцентная булка R2-D3', price: 988 };
const MAIN = { name: 'Говяжий метеорит (отбивная)', price: 3000 };
const ANOTHER_MAIN = {
  id: '6acd6b8163765e96530bd9f0',
  name: 'Биокотлета из марсианской Магнолии',
};
const SAUCE = { name: 'Соус фирменный Space Sauce', price: 80 };

const MOCK_ORDER_NUMBER = '12345';
const MOCK_ACCESS_TOKEN = 'Bearer mock-access-token';
const MOCK_REFRESH_TOKEN = 'mock-refresh-token';

const mockIngredientsRequest = async (page: Page): Promise<void> => {
  await page.routeFromHAR(INGREDIENTS_HAR, {
    url: '**/api/ingredients',
    notFound: 'abort',
  });
};

const mockAuthorizedUser = async (page: Page): Promise<void> => {
  await page.context().addCookies([
    {
      name: 'accessToken',
      value: encodeURIComponent(MOCK_ACCESS_TOKEN),
      url: BASE_URL,
    },
  ]);
  await page.addInitScript((refreshToken: string) => {
    window.localStorage.setItem('refreshToken', refreshToken);
  }, MOCK_REFRESH_TOKEN);
  await page.routeFromHAR(USER_HAR, { url: '**/api/auth/user', notFound: 'abort' });
};

const mockOrderRequest = async (page: Page): Promise<void> => {
  await page.routeFromHAR(ORDER_HAR, { url: '**/api/orders', notFound: 'abort' });
};

const getIngredientCard = (page: Page, name: string): Locator =>
  page.locator('li').filter({ has: page.getByRole('link', { name }) });

const getBurgerConstructor = (page: Page): Locator =>
  page.locator('section').filter({
    has: page.getByRole('button', { name: 'Оформить заказ' }),
  });

const addIngredient = async (page: Page, name: string): Promise<void> => {
  await getIngredientCard(page, name).getByRole('button', { name: 'Добавить' }).click();
};

const openMainPage = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(getIngredientCard(page, BUN.name)).toBeVisible();
};

test.describe('adding ingredients to the burger constructor', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredientsRequest(page);
    await openMainPage(page);
  });

  test('shows placeholders while the constructor is empty', async ({ page }) => {
    const burgerConstructor = getBurgerConstructor(page);

    await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(burgerConstructor.getByText('Выберите начинку')).toBeVisible();
  });

  test('adds a bun to the top and the bottom of the burger', async ({ page }) => {
    await addIngredient(page, BUN.name);

    const burgerConstructor = getBurgerConstructor(page);
    await expect(burgerConstructor.getByText(`${BUN.name} (верх)`)).toBeVisible();
    await expect(burgerConstructor.getByText(`${BUN.name} (низ)`)).toBeVisible();
    await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(0);
  });

  test('replaces the bun when another one is added', async ({ page }) => {
    await addIngredient(page, BUN.name);
    await addIngredient(page, ANOTHER_BUN.name);

    const burgerConstructor = getBurgerConstructor(page);
    await expect(
      burgerConstructor.getByText(`${ANOTHER_BUN.name} (верх)`)
    ).toBeVisible();
    await expect(burgerConstructor.getByText(`${ANOTHER_BUN.name} (низ)`)).toBeVisible();
    await expect(burgerConstructor.getByText(BUN.name)).toHaveCount(0);
  });

  test('adds a filling and a sauce to the middle of the burger', async ({ page }) => {
    await addIngredient(page, MAIN.name);
    await addIngredient(page, SAUCE.name);

    const burgerConstructor = getBurgerConstructor(page);
    await expect(burgerConstructor.getByText(MAIN.name)).toBeVisible();
    await expect(burgerConstructor.getByText(SAUCE.name)).toBeVisible();
    await expect(burgerConstructor.getByText('Выберите начинку')).toHaveCount(0);
  });

  test('calculates the burger price from the added ingredients', async ({ page }) => {
    await addIngredient(page, BUN.name);
    await addIngredient(page, MAIN.name);
    await addIngredient(page, SAUCE.name);

    const expectedPrice = BUN.price * 2 + MAIN.price + SAUCE.price;
    await expect(
      getBurgerConstructor(page).getByText(String(expectedPrice))
    ).toBeVisible();
  });
});

test.describe('ingredient details modal', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredientsRequest(page);
    await openMainPage(page);
  });

  test('opens a modal with the data of the clicked ingredient', async ({ page }) => {
    await page.getByRole('link', { name: ANOTHER_MAIN.name }).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();
    await expect(modal.getByRole('heading', { name: ANOTHER_MAIN.name })).toBeVisible();
    await expect(page).toHaveURL(`/ingredients/${ANOTHER_MAIN.id}`);
  });

  test('shows the calories of the clicked ingredient in the modal', async ({ page }) => {
    await page.getByRole('link', { name: BUN.name }).click();

    const modal = page.locator('#modals');
    await expect(modal.getByRole('heading', { name: BUN.name })).toBeVisible();
    await expect(modal.getByText(String(BUN.calories), { exact: true })).toBeVisible();
  });

  test('closes the modal by a click on the cross', async ({ page }) => {
    await page.getByRole('link', { name: BUN.name }).click();
    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal.getByText('Детали ингредиента')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('closes the modal by a click on the overlay', async ({ page }) => {
    await page.getByRole('link', { name: BUN.name }).click();
    const modal = page.locator('#modals');
    await expect(modal.getByText('Детали ингредиента')).toBeVisible();

    await page.getByTestId('modal-overlay').dispatchEvent('click');

    await expect(modal.getByText('Детали ингредиента')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

test.describe('burger order creation', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredientsRequest(page);
    await mockAuthorizedUser(page);
    await mockOrderRequest(page);
    await openMainPage(page);
  });

  test('creates an order, shows its number and clears the constructor', async ({
    page,
  }) => {
    await addIngredient(page, BUN.name);
    await addIngredient(page, MAIN.name);
    await addIngredient(page, SAUCE.name);

    await getBurgerConstructor(page)
      .getByRole('button', { name: 'Оформить заказ' })
      .click();

    const modal = page.locator('#modals');
    await expect(modal.getByText(MOCK_ORDER_NUMBER, { exact: true })).toBeVisible();

    const burgerConstructor = getBurgerConstructor(page);
    await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(burgerConstructor.getByText('Выберите начинку')).toBeVisible();
    await expect(burgerConstructor.getByText(MAIN.name)).toHaveCount(0);

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal.getByText(MOCK_ORDER_NUMBER, { exact: true })).toHaveCount(0);
  });
});
