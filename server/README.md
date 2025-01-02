<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../web/public/images/logo/logo-w.svg">
  <img width="250px" alt="Zisk logo" src="../web/public/images/logo/logo-b.svg">
</picture>

# Zisk Server
Zisk Server is a web server for managing the syncing of a Zisk journal. Data replication is implemented by CouchDB.

## Why Zisk Server?
By default, the Zisk app only stores your data locally on-device. Zisk Server is a self-managed server that makes it easier to maintain your own private instance of CouchDB.

### Remote Syncing Without Zisk Server
If you want to remotely sync your Zisk journals without running an instance of Zisk Server, you can add add the URL of your own CouchDB instance to Zisk. To learn more, check out the docs for the Zisk app.

## Services
Zisk Server runs using Docker Compose and maintains the following services:

 - **CouchDB**: used for storing your data. Users and authentication are managed using CouchDB. Couch-per-user is disabled, and databases are managed by the API container.
 - **Nginx**: used to proxy connections to CouchDB. It also hosts a Symfony API for creating users and databases within CouchDB. Externally, requests made to /database/* get proxied to the CouchDB container (minus the /database prefix), and requests made to /api/* get proxied to the Symfony API (minus the /api predix).

## Setup Pre-requisites
1. You need Docker and `docker-compose`.

## Getting Started
First, clone the server code.
```
mkdir zisk-server
cd zisk-server
git init
git sparse-checkout init --cone
git sparse-checkout set server
git remote add origin git@github.com:curtisupshall/zisk
git pull origin master
```
Optionally, you can clone the entire monorepo using `git clone git@github.com:curtisupshall/zisk && cd zisk/server`.

Next, create your own `.env` file.
```
cp .env.example .env
nano .env
```

You should change the following credentials:
```
# Port that your server will run on
ZISK_SERVER_PORT=6006

# Used by the API. Choose a random value
ZISK_APP_SERCRET=secret

# Used to show a display name for your server
ZISK_SERVER_NAME=...

# The admin username for the CouchDB instance. If you run an external CouchDB instance, you can ignore this
ZISK_COUCHDB_ADMIN_USER=...

# The admin password for the CouchDB instance. If you run an external CouchDB instance, you can ignore this
ZISK_COUCHDB_ADMIN_USER=...

# Used to change your server port
ZISK_SERVER_PORT=80
```

Now, run the Docker Compose services.

```
docker-compose up -d
```

Your server will be available on `http://localhost` (`http://localhost:XXXX` if you changed your port in the previous step).

## Accessing Your Server
Once your server is running, go to app.tryzisk.com and add your server to the app:
1. Go to Settings > Server.
2. Click **Add Server**
3. Paste the URL for your server. Zisk will check that the server is healthy, and then prompt you to sign in.
4. Enter the admin credentials you created earlier for your `.env` file.
5. Once you're signed in, click **Manage Server**.
6. Under the *Users* section, click **Add User**.
7. Create a new username and password. These will be the credentials you use to sync your personal journals. You can add as many additional users you'd like on this page. If you are the server admin, you can choose to make your account an administrator account, allowing you to create new users.
8. Once your personal account is created, remove the database from your app. You can do this by going to Settings > Server, then clicking on **Remove Server**.
9. Re-add the server to your app. The server should appear under *Recent Servers*. Log in using your new personal credentials.

You're done! You can now sync journals to your personal server from your desktop or mobile browser.
