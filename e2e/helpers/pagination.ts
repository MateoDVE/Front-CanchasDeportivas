import { expect, type Locator, type Page } from '@playwright/test';

/** Busca el registro por las páginas visibles, igual que un usuario. */
export async function revealOnPage(page: Page, target: Locator, navigationLabel: string) {
  const navigation = page.getByRole('navigation', { name: navigationLabel, exact: true });
  await expect(navigation).toBeVisible();
  const next = navigation.getByRole('button', { name: 'Página siguiente', exact: true });
  while (await target.count() === 0 && await next.isEnabled()) {
    await next.click();
  }
  await expect(target).toHaveCount(1);
}
