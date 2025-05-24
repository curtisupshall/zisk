FROM couchdb:latest

# Expose CouchDB port
EXPOSE 5984

# Copy custom configuration file
COPY couchdb.ini /opt/couchdb/etc/local.d/couchdb.ini

# Set up command to start CouchDB and create system databases
CMD ["/bin/sh", "-c", "/opt/couchdb/bin/couchdb & { sleep 3 ; curl -X PUT http://127.0.0.1:5986/_users ; curl -X PUT http://127.0.0.1:5986/_replicator ; curl -X PUT http://127.0.0.1:5986/_global_changes ; fg ; }"]
