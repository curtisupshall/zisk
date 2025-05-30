#!/bin/bash

# Source environment variables from mounted secret
source /run/secrets/env_file

INI_FILE="/opt/couchdb/etc/local.d/couchdb.ini"

if [ -z "$ZISK_COUCHDB_ADMIN_USER" ] || [ -z "$ZISK_COUCHDB_ADMIN_PASS" ]; then
  echo "Error: ZISK_COUCHDB_ADMIN_USER or ZISK_COUCHDB_ADMIN_PASS not set."
  exit 1
fi

if ! grep -q "^\[admins\]" "$INI_FILE"; then
  echo -e "\n[admins]\n${ZISK_COUCHDB_ADMIN_USER} = ${ZISK_COUCHDB_ADMIN_PASS}" >> "$INI_FILE"
else
  echo "The [admins] section was already present in $INI_FILE."
fi

# Start CouchDB
/opt/couchdb/bin/couchdb &

COUCHDB_PID=$!

echo "Waiting for CouchDB to start..."
ATTEMPT=0
while [ $ATTEMPT -lt 10 ]; do
  if curl -s -u "$ZISK_COUCHDB_ADMIN_USER:$ZISK_COUCHDB_ADMIN_PASS" http://127.0.0.1:5984/_up > /dev/null 2>&1; then
    echo "CouchDB is up."
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
#   echo "Attempt $ATTEMPT/10: waiting 1 second..."
  sleep 1
done

if [ $ATTEMPT -eq 10 ]; then
  echo "Error: CouchDB failed to start within 10 seconds"
  kill $COUCHDB_PID
  exit 1
fi

echo "Configuring JWT key..."
ENCODED_SECRET=$(echo -n "$AUTH_ACCESS_TOKEN_SECRET" | base64)

curl -X PUT -u "$ZISK_COUCHDB_ADMIN_USER:$ZISK_COUCHDB_ADMIN_PASS" http://127.0.0.1:5984/_node/nonode@nohost/_config/jwt_keys/hmac:$AUTH_ACCESS_TOKEN_HMAC_KID \
  -H "Content-Type: application/json" \
  -d "\"$ENCODED_SECRET\""

kill $COUCHDB_PID
