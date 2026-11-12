# That’ll Do Now prototype

A local browser extension for limiting access to selected feeds. This is an early prototype and has not been validated against the live websites or prepared for store publication.

## Try in Chrome or Edge

1. Run `npm install` and `npm run build` in this folder.
2. Open `chrome://extensions` (or `edge://extensions`) and enable developer mode.
3. Choose **Load unpacked**, then select this project's `extension` folder.
4. Open the extension's popup to change settings. Refresh affected pages if needed.
5. To remove the prototype, return to the extensions page and select Remove.

The extension can read and change pages on the supported sites. The current implementation stores settings locally and does not include analytics or a server.

## Checks

Run `npm test` to build the TypeScript and run the simulated page and navigation checks. These checks do not replace testing live sites, real account states, or Firefox compatibility.

## Limitations

Website layouts and navigation change; blocking can fail, miss content, or interfere with pages. The overlay does not guarantee that background audio stops. Mobile apps are not affected. Firefox and Android support require further work and testing.
