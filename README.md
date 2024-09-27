# observation-portal-frontend

## Environment variables

| Variable                              | Description                           | Default                 |
| ------------------------------------- | ------------------------------------- | ----------------------- |
| `VUE_APP_OBSERVATION_PORTAL_API_URL`  | Observation portal API URL            | `http://127.0.0.1:8000` |
| `VUE_APP_ARCHIVE_API_URL`             | Archive API URL                       | `http://127.0.0.1:8000` |
| `VUE_APP_SIMBAD_SERVICE_URL`          | Simbad service URL                    | `http://127.0.0.1:8000` |
| `INTERNAL_OBSERVATION_PORTAL_API_URL` | In-cluster observation portal API URL | `http://127.0.0.1:8000` |

The app configuration is stored in [public/config/urls.json](public/config/urls.json). When
running the project using the docker image, the configuration in this file is updated in the
docker entrypoint with the values set in the environment variables. To disable this behavior,
for example when instead setting the configuration via a ConfigMap when running the application
in Kubernetes, set `DISABLE_OVERWRITE_APP_CONFIG_IN_ENTRYPOINT=true`.

The internal observation portal url is used in the nginx configuration. It is necessary to route requests correctly
when both the frontend and backend hostnames are the same. The kubernetes in-cluster url should be used for this value.

## Project setup
```
npm install
```

### Using local ocs-component-lib
If you are also developing against local changes to the ocs-component-lib project, you will need to follow some extra steps to install and use those changes locally without problems. The best description of the local development problem I've found is [here](https://stackoverflow.com/questions/64864935/runtime-error-integrating-a-component-lib-that-uses-vue-composition-api-you-m), but basically if you just install the local directory or `npm link` it, the library will have its own different copy of the vue-composition-api library it attempts to use, which will not be instantiated properly so it will fail to work right. You can get around this by following these specific steps to install the local copy of the ocs-component-lib:

In the ocs-component-lib root directory
1. `npm install`
2. `npm run build`
3. `npm prune --production`
4. `npm pack` (should generate a local `ocs-component-lib-{version}.tgz` file)

In this root directory:
1. `npm uninstall ocs-component-lib`
2. `npm install path/to/ocs-component-lib-{version}.tgz`

### Local Development

If you are developing locally, you will probably need to set a few variables in your development Observation
Portal Django local settings file to handle cross site requests. For example, if your frontend is running at
`http://127.0.0.1:8080`, you would set the following:

```
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_WHITELIST = [
    'http://127.0.0.1:8080'
]
CSRF_TRUSTED_ORIGINS = [
    '127.0.0.1:8080'
]
```

Then, to run a hot-reload server for developing on the frontend:
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint:fix
```

### Checks for linting errors without fixing them
```
npm run lint:check
```
