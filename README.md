# mel-alert

Sends alerts from MELCloud by email or by pushover. Requires [NodeJs](https://nodejs.org/), JavaScript runtime environment,
to run in host system and [Docker Desktop](https://www.docker.com/products/docker-desktop/) or alternative to run in container.

## Steps to make it run for you

If you are planning to run this software on you're system, run `npm install` to install dependencies.

Setup environmental variables in [.env](./.env):

```
MELCLOUD_USERNAME=<melcloud username>
MELCLOUD_PASSWORD=<melcloud password>
MELCLOUD_APPVERSION=1.34.11.0
```
If you don't want to receive emails or pushover notifications,
you can drop environment optional variables.
Also make sure that Melcloud application version is correct.

Edit file [alerts.json](./src/config/alerts.json) to create
alerts you might be interested in. The file has few examples
how to create them.

#### How to find building id and device ids

Easy, just run
```
npx ts-node src/main.ts devices [.env]
```
in the host system

### Get data (in the host system)

To get data from the devices, run
```
npm start
```
or

```
npx ts-node src/main.ts data [.env]
```

if you want to use customized `.env` file. 

### Docker

Build docker image based on the [Dockerfile](./Dockerfile) file

If you want to run loop more than once in an hour, adjust the `ALERT_INTERVAL_MS` environment variable.

```
docker build -t mel-alert .
```

Run the docker image in container

```
docker run --env-file ./.env -w /mel-alert -t -d --name mel-alert mel-alert bash -c "./node_modules/.bin/ts-node ./loop.ts"
```
