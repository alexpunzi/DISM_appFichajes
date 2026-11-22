import { expect, test } from '@playwright/test';

test('redirects the app root to the login page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('ion-title')).toContainText('Iniciar sesión');
  await expect(page.locator('ion-input[name="usuario"]')).toBeVisible();
  await expect(page.locator('ion-button').filter({ hasText: 'Entrar' })).toBeVisible();
});

test('redirects protected ficha routes to login', async ({ page }) => {
  for (const route of ['/registro-fichaje', '/consulta-fichajes']) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login\?returnUrl=/);
    expect(new URL(page.url()).searchParams.get('returnUrl')).toBe(route);
  }
});
