#!/bin/sh

CONFIG_FILE=/app/config.json

die() {
	echo "$@" >&2
	exit 1
}

if [[ -z "$VUE_APP_OBSERVATION_PORTAL_API_URL" ]]; then
	die "ERROR: required environment variable VUE_APP_OBSERVATION_PORTAL_API_URL not set"
fi

if [[ -z "$VUE_APP_ARCHIVE_API_URL" ]]; then
	die "ERROR: required environment variable VUE_APP_ARCHIVE_API_URL not set"
fi

if [[ -z "$VUE_APP_SIMBAD_SERVICE_URL" ]]; then
	die "ERROR: required environment variable VUE_APP_SIMBAD_SERVICE_URL not set"
fi

echo '{
  "observationPortalApiUrl": "'$VUE_APP_OBSERVATION_PORTAL_API_URL'",
  "archiveApiUrl": "'$VUE_APP_ARCHIVE_API_URL'",
  "simbadServiceUrl": "'$VUE_APP_SIMBAD_SERVICE_URL'"
}' > ${CONFIG_FILE}

# Run the default nginx entrypoint
exec nginx -g 'daemon off;'
