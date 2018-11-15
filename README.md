# Webb-App-Kontaktruta-funktionskontakter
Sitevision boilerplate used as template
## Setup
* `git clone https://github.com/sitevision/webapp-boilerplate.git`
* `cd webapp-boilerplate`
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

## How to use
* Tokens required for minsida/kontaktapi insert in index.js 
        endURL = 'app_token=[Insert_token]&app_secret=[insert_secret_key]';
* Restapp is required for config to access minsida/kontaktapi, https://github.com/malmostad/REST-App-Kontaktruta
* If the restapp changes name, config.js needs to reflect this by updating the variable `api` url
* For local development (use variable `local = true` in index.js and config.js)
* For reCaptcha to work the webapp needs: 
    * Accesss to this script `<script src="https://www.google.com/recaptcha/api.js" async defer></script>`
    * An account at https://www.google.com/recaptcha/, if you have reCatchpa through SiteVision you should already have an account. You need to register your domain.
    * The contact.js file needs to have your reCatchpa siteKey added in it's state
    * The mailModule.js, in module/server need to have the recatchpa private-key set in var `reCatchpaKey`

## TODO
* Adding mailtemplate and extend mail functionality
* Stadsområden
* If invalid recatchpa, reset the catchpa in client. Add recatchpa key in config part.
* Meta-inheritence

    


