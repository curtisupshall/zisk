# Database
db-build:
	DOCKER_BUILDKIT=1 docker build \
		--secret id=env_file,src=.env \
		-t zisk-couchdb \
		-f docker/database/database.Dockerfile \
		docker/database

db-run:
	docker run \
		-d \
		--name zisk-couchdb \
		-p 5984:5984 \
		zisk-couchdb

db-stop:
	docker stop zisk-couchdb || true

db-clean: db-stop
	docker rm zisk-couchdb || true
	docker image rm zisk-couchdb || true

db: db-build db-run

# Clean
clean: db-clean

.PHONY: \
	db-build db-run db db-stop db-clean \
	clean
