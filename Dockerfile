FROM node:20.18.0-slim

RUN apt-get update && apt-get upgrade -y
RUN mkdir /mel-alert

COPY ./package.json /mel-alert
COPY ./tsconfig.json /mel-alert
COPY src/ /mel-alert

WORKDIR /mel-alert
RUN npm install
