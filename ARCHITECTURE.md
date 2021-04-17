# Architecture

This is a standard frontend application consisting of two parts&mdash;UI and server.

## UI

Currently, it's *almost* a single-page application.
Most components are in page `src/routes/index.svelte`, but there is also a simple separate admin page `src/routes/sensors.svelte` for managing long running background task.

Our design uses [IBM Carbon components](https://github.com/IBM/carbon-components-svelte).

## Server

UI components call our API endpoints (`.json.js` files in `src/routes/`) which in turn call [ABRA FLEXI](https://www.flexibee.eu/api/) APIs to store and retrieve data about parking slot reservations and real-time sensors detecting parking slot occupancy.

This indirection is necessary to guard API calls against unauthorized use.

There is also long-running component `src/lib/server/sensor.js` checking sensors and editing reservations accordingly.

Logic on server is maintained in `src/lib/server/`.
Most importantly, all low-level API calls are wrapped in classes (`flexiApi.js`, `employee.js` and `receptionist.js`).

## Login

Currently, BASIC HTTP authentication is used both in client-server and server-server communication.
On client, the Base64-encoded authorization value is stored in cookies to persist sessions.

This is implemented in `LoginScreen.svelte` and `hooks.js`.
