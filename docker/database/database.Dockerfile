# syntax=docker/dockerfile:experimental

FROM couchdb:latest

# Expose CouchDB port
EXPOSE 5984

# Copy baseline configuration file
COPY couchdb.ini /opt/couchdb/etc/local.d/couchdb.ini

# Copy and run setup script during build
COPY setup.sh /usr/local/bin/setup.sh
RUN --mount=type=secret,id=env_file \
    chmod +x /usr/local/bin/setup.sh && \
    /usr/local/bin/setup.sh

# Use default CouchDB entrypoint and command
CMD ["couchdb"]
