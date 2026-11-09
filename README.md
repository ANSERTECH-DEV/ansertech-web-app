# Ansertech Web App (frontend)

Frontend del sistema de cotización automatizada de Ansertech Perú S.A.C.: los operadores revisan las solicitudes de cotización (RFQ) que la IA (Gemini) extrajo de los correos, las aprueban o rechazan, y administran el inventario.

- **Stack:** Angular 16.2 · TypeScript 5.1 · PrimeNG 17 · RxJS 7.8 · CSS plano · hash routing (`#/`)
- **Backend:** [`ansertech-backend`](../ansertech-backend) (Spring Boot, puerto 8080)

## Requisitos

- Node.js compatible con Angular 16 (18.x recomendado) y npm
- Backend corriendo en `http://localhost:8080`

## Levantar en local

```bash
npm install
npm start            # ng serve → http://localhost:4200
```

La URL de la API se define en `src/environments/environment.ts`. Desde el 2026-11-08 apunta al backend desplegado en Cloud Run (`https://ansertech-backend-183235697489.southamerica-east1.run.app/api`, `production: true`); la línea de `http://localhost:8080/api` quedó comentada.

> ⚠️ No existe `environment.prod.ts` ni `fileReplacements` en `angular.json`, así que `npm start` en local **también usa el backend de Cloud Run** y su BD. Para probar contra el backend local, descomenta la línea de `localhost` (y no subas ese cambio).

Desplegado en Netlify: https://ansertechweb.netlify.app. El build publicado al 2026-11-08 todavía no incluye el filtro de KPIs del dashboard (`016bc36`) ni la tarjeta "Conexión con Outlook".

> Si en local la tarjeta "Conexión con Outlook" muestra "Error interno del servidor", el front está llamando a Cloud Run, que aún no tiene esos endpoints. Activa `http://localhost:8080/api` en `environment.ts` y vuelve a iniciar sesión, porque el token de un backend no sirve en el otro.

Usuarios: en la BD de Azure actual solo existen las cuentas ADMIN de los autores. `admin@ansertech.pe` y `operador@ansertech.pe` (de V6) se perdieron al recrear la base el 2026-09-27.

## Pantallas

| Ruta | Componente | Qué hace |
|---|---|---|
| `#/login` | `AuthComponent` | Login con JWT (se guarda en `localStorage`) |
| `#/cotizaciones` | `PendingListComponent` | Lista de RFQs con tabs por estado |
| `#/cotizaciones/:id/checking` | `ReviewDetailComponent` | Revisión del RFQ: polling cada 3 s mientras la IA procesa, tabla de stock, aprobar/rechazar |
| `#/inventario` | `InventoryComponent` | CRUD de productos, badge de stock bajo, carga masiva desde Excel con vista previa. Filtros de marca/categoría con buscador (incluyen "Sin marca"/"Sin categoría"), tarjetas de alto uniforme y precios en soles enteros |
| `#/dashboard` | `DashboardComponent` | Tarjeta KPIs con datos reales y filtro por periodo (`GET /api/dashboard/kpis`). Exportar Excel de correos (con rango de fechas) e inventario. Tarjeta "Conexión con Outlook" (solo ADMIN) para vincular la cuenta de correo y ver el log del servidor. "Cotizaciones por estado" y "Clientes más activos" siguen con datos mock |

El detalle botón por botón está en [`../front.md`](../front.md).

La barra de navegación queda fija al hacer scroll. `AppModule` importa `BrowserAnimationsModule`, que lo necesitan los paneles desplegables de PrimeNG (`p-multiSelect`): sin él, el desplegable no abre.

## Estructura

```
src/app/
├── components/   UI compartida (menú, footer)
├── core/         interceptors (JWT) y modelos TypeScript
├── guards/       AuthGuard
├── layouts/      blank (login) y main (con menú)
├── pages/        un módulo por feature (authentication, dashboard, inventory, quotations)
├── services/     un servicio HTTP por recurso de la API
└── shared/       DTOs compartidos
```

## Tests

```bash
npx ng test --watch=false --code-coverage --browsers=ChromeHeadless
open coverage/ansertech-web-app/index.html
```

63 specs Karma + Jasmine, todos pasan al 2026-11-08 (servicios, interceptor JWT, `ReviewDetailComponent`, `AppComponent`, filtros de `InventoryComponent`, periodo de KPIs de `DashboardComponent` y `OutlookConnectionComponent`). Resultados y cobertura: [`../docs/informe_testing.md`](../docs/informe_testing.md).

## Limitaciones conocidas

- `quotation.service.ts` solo expone `getById`: el reenvío (`POST /quotations/{id}/send`) y la descarga de PDF (`GET /quotations/{id}/pdf`) existen en el backend pero no en la UI.
- "Cotizaciones por estado" y "Clientes más activos" del dashboard son mock; `/api/dashboard/stats` no se usa.
- `AuthService.login()` no guarda el token (lo hace `AuthComponent`); `JwtInterceptor` no maneja 401.
- `services/cotizaciones.service.ts` y `services/productos.service.ts` son código muerto de un prototipo anterior.

Lista completa y priorizada: [`../proyecto_tesis_resumen.md`](../proyecto_tesis_resumen.md) §5.
