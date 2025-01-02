FROM couchdb:latest

# Copy the couchdb.ini file
COPY database/couchdb.ini /opt/couchdb/etc/local.d/couchdb.ini

EXPOSE 5984

CMD ["couchdb"]
