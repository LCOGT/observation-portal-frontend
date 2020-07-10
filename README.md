# observation-portal-frontend

## Environment variables

| Variable                             | Description                | Default                 |
| ------------------------------------ | -------------------------- | ----------------------- |
| `VUE_APP_OBSERVATION_PORTAL_API_URL` | Observation portal API URL | `http://127.0.0.1:8000` |
| `VUE_APP_ARCHIVE_API_URL`            | Archive API URL            | `http://127.0.0.1:8000` |
| `VUE_APP_SIMBAD_SERVICE_URL`         | Simbad service URL         | `http://127.0.0.1:8000` |

The app configuration is stored in [public/config/urls.json](public/config/urls.json). When
running the project using the docker image, the configuration in this file is updated in the
docker entrypoint with the values set in the environment variables. To disable this behavior,
for example when instead setting the configuration via a ConfigMap when running the application
in Kubernetes, set `DISABLE_OVERWRITE_APP_CONFIG_IN_ENTRYPOINT=true`.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
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
npm run lint
```
