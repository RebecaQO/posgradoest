import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const data = pathname.endsWith('/api/programas/activos')
      ? [{ id: 12, title: 'Diplomado de prueba', type: 'Diplomado', description: 'Información promocional del programa académico.', modality: 'Virtual', duration: '6 meses' }]
      : pathname.endsWith('/api/institucion')
        ? {
          id: 1,
          whatsapp: '+591 75855943',
          revista_varianza_url: 'https://ieta.umsa.bo/sobre-la-revista-varianza',
          estadistica_url: 'https://estadistica.umsa.bo/',
          sociest_url: 'https://www.sociest.org/?m=1',
          facebook_url: 'https://www.facebook.com/share/1AHBshwTmJ/',
          instagram_url: 'https://www.instagram.com/estadisticaumsa?lqvp=c3ppYjFjaWo3amF0',
          contacto_etiqueta: 'SEDES PRUEBA',
          contacto_titulo: 'Ubicación editable',
          contacto_descripcion: 'Descripción administrable de las sedes.',
        }
        : [];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
  });
});

test('promotes an academic program without collecting application data', async ({ page }) => {
  await page.goto('/#admision');
  const closePromotion = page.getByRole('button', { name: 'Cerrar publicidad' });
  await closePromotion.waitFor({ state: 'visible', timeout: 2_000 }).catch(() => {});
  if (await closePromotion.isVisible()) await closePromotion.click();

  await expect(page.getByRole('heading', { name: 'Programas de Posgrado en Estadística' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Diplomado de prueba' })).toBeVisible();
  await expect(page.getByText('Virtual · 6 meses')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Consultar información' })).toHaveAttribute('href', /wa\.me\/59175855943/);
  await expect(page.locator('#main form')).toHaveCount(0);
  await expect(page.locator('#main').getByLabel(/cédula|correo|documentos|consentimiento/i)).toHaveCount(0);

  const results = await new AxeBuilder({ page }).include('#main').analyze();
  expect(results.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact))).toEqual([]);
});

test('home and program catalog have no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Revista Varianza (IETA)' })).toHaveAttribute('href', 'https://ieta.umsa.bo/sobre-la-revista-varianza');
  await expect(page.getByRole('link', { name: 'Carrera de Estadística' })).toHaveAttribute('href', 'https://estadistica.umsa.bo/');
  await expect(page.getByRole('link', { name: 'Sociedad de Estadística' })).toHaveAttribute('href', 'https://www.sociest.org/?m=1');
  await expect(page.getByRole('link', { name: 'Facebook' })).toHaveAttribute('href', 'https://www.facebook.com/share/1AHBshwTmJ/');
  await expect(page.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/estadisticaumsa?lqvp=c3ppYjFjaWo3amF0');
  const closePromotion = page.getByRole('button', { name: 'Cerrar publicidad' });
  await closePromotion.waitFor({ state: 'visible', timeout: 2_000 }).catch(() => {});
  if (await closePromotion.isVisible()) await closePromotion.click();

  const homeResults = await new AxeBuilder({ page }).include('#main').analyze();
  expect(homeResults.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact))).toEqual([]);

  await page.goto('/#programas');
  const catalogResults = await new AxeBuilder({ page }).include('#main').analyze();
  expect(catalogResults.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact))).toEqual([]);
});

test('contact view hides the channel strip and displays its editable heading', async ({ page }) => {
  await page.goto('/');
  const closePromotion = page.getByRole('button', { name: 'Cerrar publicidad' });
  await closePromotion.waitFor({ state: 'visible', timeout: 2_000 }).catch(() => {});
  if (await closePromotion.isVisible()) await closePromotion.click();
  await page.getByRole('button', { name: 'Ubicación & Contacto' }).click();

  await expect(page.getByRole('heading', { name: 'Ubicación editable' })).toBeVisible();
  await expect(page.getByText('SEDES PRUEBA')).toBeVisible();
  await expect(page.getByText('Descripción administrable de las sedes.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Canales Oficiales de Atención' })).toHaveCount(0);
  await expect(page.locator('.cv-channels-section')).toHaveCount(0);

  await page.getByRole('button', { name: 'Inicio' }).click();
  await expect(page.getByRole('heading', { name: 'Unidad de Posgrado en Estadística' })).toBeVisible();
});
