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
If you don't want to receive emails or pushover notifications about alerts,
you can drop optional environment variables.
Also make sure that Melcloud application version is correct.

There are few examples how to create alert in the [.env](./.env) file.

#### How to find building id and device ids

Easy, just run
```
npx ts-node src/main.ts devices .env
```
in the host system

### Get data (in the host system)

To get data from the devices, run
```
npm start
```
or

```
npx ts-node src/main.ts data .your-env
```

if you want to use customized `.env` file. 

### Docker

Build docker image based on the [Dockerfile](./Dockerfile) file

```
docker build -t mel-alert .
```

If you want to run loop more than once in an hour, adjust the `ALERT_INTERVAL_MS` environment variable.

Run the docker image in container

```
docker run --restart unless-stopped --env-file ./.env -w /mel-alert -t -d --name mel-alert mel-alert bash -c "./node_modules/.bin/ts-node ./main.ts loop"
```

#### Run commands in container

While the container is up and running, you can run commands from your host system to be run in container:

`docker exec --env-file ./.env -it mel-alert npx ts-node ./main.ts <command>`.

For example getting raw data from the cloud, run

`docker exec --env-file ./.env -it mel-alert npx ts-node ./main.ts raw`.

See [commands.ts](./src/commands.ts) for supported commands.
