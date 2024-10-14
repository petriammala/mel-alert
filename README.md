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

Edit file [devices.json](./src/config/devices.json) to list all devices you want to
be monitored. Also edit file [alerts.json](./src/config/alerts.json) to create
alerts you might be interested in.

#### How to find building id and device ids

1. Login to MelCloud account at https://app.melcloud.com
2. In the Building List page click one of the devices with right button of the mouse
3. Select Inspect or Inspect Element to open developer console
4. In the source code of the page, seek `data-buildingid="nnnnnn"` which is the id of the building
5. Underneath the building id there is another id attribute `id="device-nnnnnnnn-i"` where `nnnnnnnn` should be the id of the device
6. If you have multiple devices, they all should be found underneath the buildiing id

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
docker run --env-file ./.env -w /mel-alert -t -d --name mel-alert mel-alert bash -c "./node_modules/.bin/ts-node ./loop.ts"
```
