# Frontend structure

The frontend is organized by feature and shared infrastructure:

- `app/`: application composition, routing, and route guards.
- `features/auth/`: public login, ERP login, registration, auth context, and auth tests.
- `features/public/`: public landing and public informational pages.
- `features/debtor/`: debtor portal pages.
- `features/analyst/`: bank analyst portal pages.
- `features/erp/`: internal CCI ERP pages.
- `features/misc/`: cross-flow pages such as access denied and not found.
- `shared/components/`: reusable UI, layout, and shared widgets.
- `shared/services/`: API client, adapters, app service contract, and mock service kept only as development reference.
- `shared/lib/`: small shared helpers such as role redirects, access control, and session lifecycle.
- `shared/types/`: domain types used by features and services.
- `shared/mocks/`: static data used by mock-only review screens.
- `shared/config/`: navigation configuration.
- `shared/hooks/`: reusable hooks.

Feature pages can import from `shared/*`, but `shared/*` should not import feature pages.
