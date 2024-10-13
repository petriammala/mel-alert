# mel-alert

Sends alerts from MELCloud by email or by pushover.

## Steps to make it run for you

Setup environmental variables in [.env](./.env):

```
MELCLOUD_USERNAME=<melcloud username>
MELCLOUD_PASSWORD=<melcloud password>
MELCLOUD_APPVERSION=1.34.11.0
```
If you don't want to receive emails or pushover notifications,
you can drop environment optional variables.
Also make sure that Melcloud application version is correct.

### Run once (in host system)

```
npm start
```
or

```
npx ts-node src/main.ts .env-local 
```

if you want to use customized `.env` file

### Docker

Build docker image based on the [Dockerfile](./Dockerfile) file

If you want to run loop more than once in an hour, adjust the `ALERT_INTERVAL_MS` environment variable.

```
docker build -t mel-alert .
```

Run the docker image in container

```
docker run --env-file ./.env -w /mel-alert -t -d --name mel-alert mel-alert bash -c "./node_modules/.bin/ts-node ./data.ts"
```
