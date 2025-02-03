FROM couchdb:latest

# Expose CouchDB port
EXPOSE 5984

# Copy the setup script
COPY build/database-setup.sh /usr/local/bin/database-setup.sh
RUN chmod +x /usr/local/bin/database-setup.sh

# Copy the initial CouchDB configuration
COPY build/couchdb.ini /opt/couchdb/etc/local.d/couchdb.ini

# Fix permissions to allow the couchdb user to write to the configuration directory
USER root
RUN chown -R couchdb:couchdb /opt/couchdb/etc/local.d

# Switch back to the couchdb user
USER couchdb

# Default entrypoint: run setup script and start CouchDB
ENTRYPOINT ["/bin/bash", "-c", "if [ ! -f /opt/couchdb/etc/local.d/setup_completed ]; then /usr/local/bin/database-setup.sh; fi && exec /opt/couchdb/bin/couchdb"]
