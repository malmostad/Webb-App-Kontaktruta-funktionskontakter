# Webb-App-Kontaktruta
Sitevision boilerplate used as template
## Setup
* `checkout from git`
* `npm install`
* `npm run setup`
## Building
* `npm run create-addon` create an addon with the name configured in the setup task
* `npm run zip` compress `/src` into `/dist`
* `npm run deploy` compress `/src` into `/dist` and upload to the addon configured in the setup task
* `npm run force-deploy` compress `/src` into `/dist` and upload to the addon configured in the setup task. This will overwrite the current WebApp if it has the same version and id defined in manifest.json
* `npm run sign` compress `/src` into `/dist` and invoke the signing endpoint of the SiteVision developer REST API. A signed version of the WebApp will be created in the `/dist` folder
* `npm run prod-deploy` deploy the signed WebApp to a production environment

[Visit developer.sitevision.se for more information](https://developer.sitevision.se)

---

## Dependencies
* REST-app (https://github.com/malmostad/REST-App-Kontaktruta)

## How to use
This WEB-app uses one REST-app (https://github.com/malmostad/REST-App-Kontaktruta) to connecting to the contact_api (https://github.com/malmostad/intranet-dashboard/wiki/Contacts-API-v1). The WEB-app responsibility is to enable an interface for search contacts (persons or functions) and render contact information. If the restapp changes name, config.js needs to reflect this by updating the variable `api` url

The REST-app requires an 'app_token' and an 'app_secret', GUI for that is in the REST-app settings

## Settings

### Global settings
* REST-api URL - default window.location.origin + /rest-api/kontaktruta/
* Metadata to save contacts - default 'kontaktrutastadsomradenV4_3'

### Local settings
* For every instance of Kontaktruta it is possible to setup contacts

## TODO
* For local development (use variable `local = true` in index.js and config.js)

