<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../app/public/images/logo/logo-w.svg">
  <img width="250px" alt="Zisk logo" src="../app/public/images/logo/logo-b.svg">
</picture>

# Zisk Server
Zisk Server is a web server for managing the syncing of a Zisk journal. Data replication is implemented by CouchDB.

## Why Zisk Server?
By default, the Zisk app only stores your data locally on-device using PouchDB - a JavaScript implementation of CouchDB. Zisk Server is a set self-managed services that makes it easier to maintain your own private instance of CouchDB.

## Setup

This section will get you set up using Zisk Server

### 1. Database

Zisk uses CouchDB. You can use the provided Docker image to start a pre-configured instance of CouchDB (recommended), or you can manually set up an existing database

#### Pre-Configured Setup

```
cd docker
docker build -t you/zisk-couchdb ./database
docker run -d -p 5984:5984 you/zisk-couchdb
```

#### Manual Setup

This encompasses the end-to-end setup steps.

1. Spin up a new instance of CouchDB in Docker
```
TODO insert docker command for running couchDB
```

2. 