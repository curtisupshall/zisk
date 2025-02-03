#!/bin/bash

set -e

CONFIG_MARKER="/opt/couchdb/etc/local.d/setup_completed"

if [[ ! -f "$CONFIG_MARKER" ]]; then
  echo "Running initial setup for CouchDB."

  # Ensure required environment variables are present
  if [[ -z "$AUTH_ACCESS_TOKEN_SECRET" || -z "$AUTH_ACCESS_TOKEN_HMAC_KID" || -z "$ZISK_COUCHDB_ADMIN_USER" || -z "$ZISK_COUCHDB_ADMIN_PASS" ]]; then
    echo "Environment variables AUTH_ACCESS_TOKEN_SECRET, AUTH_ACCESS_TOKEN_HMAC_KID, ZISK_COUCHDB_ADMIN_USER, and ZISK_COUCHDB_ADMIN_PASS must be set."
    exit 1
  fi

  # Base64 encode the secret
  ENCODED_SECRET=$(echo -n "$AUTH_ACCESS_TOKEN_SECRET" | base64)

  # Add the secret to the CouchDB config file
  CONFIG_FILE="/opt/couchdb/etc/local.d/couchdb.ini"
  mkdir -p "$(dirname "$CONFIG_FILE")"
  cat >> "$CONFIG_FILE" <<EOF

[jwt_keys]
hmac:$AUTH_ACCESS_TOKEN_HMAC_KID = $ENCODED_SECRET

[admins]
$ZISK_COUCHDB_ADMIN_USER = $ZISK_COUCHDB_ADMIN_PASS
EOF

  echo "CouchDB configured with JWT secret and admin credentials."

  # Create marker file to indicate setup is complete
  touch "$CONFIG_MARKER"
else
  echo "Setup already completed. Skipping."
fi
