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

La URL de la API se define en `src/environments/environment.ts`. Apunta al backend desplegado en Cloud Run (`https://ansertech-backend-183235697489.southamerica-east1.run.app/api`, `production: true`); la línea de `http://localhost:8080/api` está comentada. Entre el 2026-11-09 y el 2026-11-13 apuntó a localhost; `436154d` la devolvió a Cloud Run.

> ⚠️ No existe `environment.prod.ts` ni `fileReplacements` en `angular.json`, así que `npm start` en local **también usa el backend de Cloud Run** y su BD. Para probar contra el backend local, descomenta la línea de `localhost` (y no subas ese cambio).

Desplegado en Netlify: https://ansertechweb.netlify.app. El build publicado al 2026-11-08 todavía no incluye el filtro de KPIs del dashboard (`016bc36`) ni la tarjeta "Conexión con Outlook".

> Si en local las tarjetas "Conexión con Outlook" o "Parámetros" muestran un error (o el botón de Cotizaciones dice solo "Leer los últimos correos", sin número), probablemente el front está llamando a una versión de Cloud Run que aún no tiene esos endpoints. Activa `http://localhost:8080/api` en `environment.ts` y vuelve a iniciar sesión, porque el token de un backend no sirve en el otro.

Usuarios: en la BD de Azure actual solo existen las cuentas ADMIN de los autores. `admin@ansertech.pe` y `operador@ansertech.pe` (de V6) se perdieron al recrear la base el 2026-09-27.

## Pantallas

| Ruta | Componente | Qué hace |
|---|---|---|
| `#/login` | `AuthComponent` | Login con JWT (se guarda en `localStorage`) |
| `#/cotizaciones` | `PendingListComponent` | Lista de RFQs con tabs por estado. Abajo a la derecha, el botón **"Leer los últimos N correos"** (N sale de `GET /api/parameters/email-count`; "Leer el último correo" si vale 1, o el texto sin número si no se pudo leer) llama a `POST /api/emails/trigger-polling`. El backend responde al instante y lee en segundo plano, así que el portal sigue usable; los RFQ nuevos aparecen al pulsar ↻ Actualizar. Solo ADMIN |
| `#/cotizaciones/:id/checking` | `ReviewDetailComponent` | Revisión del RFQ: polling cada 3 s mientras la IA procesa, tabla de stock, aprobar/rechazar |
| `#/inventario` | `InventoryComponent` | CRUD de productos, badge de stock bajo, carga masiva desde Excel con vista previa. Filtros de marca/categoría con buscador (incluyen "Sin marca"/"Sin categoría"), tarjetas de alto uniforme y precios en soles enteros |
| `#/dashboard` | `DashboardComponent` | Tarjeta KPIs con datos reales y filtro por periodo (`GET /api/dashboard/kpis`). Exportar Excel de correos (con rango de fechas) e inventario. Tarjeta "Conexión con Outlook" (solo ADMIN): al pulsar **Actualizar** muestra la URL y el código de Microsoft leídos del log del backend, sin polling; también permite ver el log del servidor. Tarjeta "Parámetros" (`ParametersComponent`, desde 2026-11-13): lista nombre, descripción y valor de cada parámetro y permite editar el valor (guardar requiere ADMIN). "Cotizaciones por estado" y "Clientes más activos" siguen con datos mock |

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

Specs Karma + Jasmine: servicios, interceptor JWT, `ReviewDetailComponent`, `AppComponent`, filtros de `InventoryComponent`, periodo de KPIs de `DashboardComponent`, `OutlookConnectionComponent`, `PendingListComponent` (botón de leer correos, 7) y `ParametersComponent` (6). Resultados y cobertura: [`../docs/informe_testing.md`](../docs/informe_testing.md).

Al 2026-11-17: **104/104** pasan (incluye `AuthComponent`, 10: avisos de login; y "Limpiar filtros" del inventario, que ahora también vacía el buscador).

## Limitaciones conocidas

- `quotation.service.ts` solo expone `getById`: el reenvío (`POST /quotations/{id}/send`) y la descarga de PDF (`GET /quotations/{id}/pdf`) existen en el backend pero no en la UI.
- "Cotizaciones por estado" y "Clientes más activos" del dashboard son mock; `/api/dashboard/stats` no se usa.
- `JwtInterceptor` no maneja 401 (no hay logout automático cuando expira el token).
- `services/cotizaciones.service.ts` y `services/productos.service.ts` son código muerto de un prototipo anterior.
- La validación 1–10 de `ParametersComponent.save()` aplica a **todos** los parámetros (hoy solo existe "Cantidad de correos"); el backend admite de 1 a 1000.
- El modelo declara `value: number`, pero el backend lo envía como texto (`"2"`); se ve igual en pantalla, pero `draft` arranca como string hasta que se edita el campo.

Lista completa y priorizada: [`../proyecto_tesis_resumen.md`](../proyecto_tesis_resumen.md) §5.
