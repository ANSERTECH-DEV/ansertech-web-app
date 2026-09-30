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

La URL de la API se define en `src/environments/environment.ts` (`apiUrl: http://localhost:8080/api`).

> ⚠️ No existe `environment.prod.ts` ni `fileReplacements` en `angular.json`: un `ng build` de producción también apunta a `localhost:8080`. Hay que crearlo antes de desplegar.

Usuarios: en la BD de Azure actual solo existen las cuentas ADMIN de los autores. `admin@ansertech.pe` y `operador@ansertech.pe` (de V6) se perdieron al recrear la base el 2026-09-27.

## Pantallas

| Ruta | Componente | Qué hace |
|---|---|---|
| `#/login` | `AuthComponent` | Login con JWT (se guarda en `localStorage`) |
| `#/cotizaciones` | `PendingListComponent` | Lista de RFQs con tabs por estado |
| `#/cotizaciones/:id/checking` | `ReviewDetailComponent` | Revisión del RFQ: polling cada 3 s mientras la IA procesa, tabla de stock, aprobar/rechazar |
| `#/inventario` | `InventoryComponent` | CRUD de productos, badge de stock bajo, carga masiva desde Excel con vista previa. Filtros de marca/categoría con buscador (incluyen "Sin marca"/"Sin categoría"), tarjetas de alto uniforme y precios en soles enteros |
| `#/dashboard` | `DashboardComponent` | Exportar Excel de correos e inventario (los KPIs todavía son mock) |

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

52 specs Karma + Jasmine (servicios, interceptor JWT, `ReviewDetailComponent`, `AppComponent` y filtros de `InventoryComponent`). Resultados y cobertura: [`../docs/informe_testing.md`](../docs/informe_testing.md).

## Limitaciones conocidas

- `quotation.service.ts` solo expone `getById`: el reenvío (`POST /quotations/{id}/send`) y la descarga de PDF (`GET /quotations/{id}/pdf`) existen en el backend pero no en la UI.
- El dashboard no consume `/api/dashboard/stats`.
- `AuthService.login()` no guarda el token (lo hace `AuthComponent`); `JwtInterceptor` no maneja 401.
- `services/cotizaciones.service.ts` y `services/productos.service.ts` son código muerto de un prototipo anterior.

Lista completa y priorizada: [`../proyecto_tesis_resumen.md`](../proyecto_tesis_resumen.md) §5.
