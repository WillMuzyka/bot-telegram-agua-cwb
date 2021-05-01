
FROM node:12-alpine
MAINTAINER William Nunes

WORKDIR /usr/src/app

COPY . .
RUN yarn

ENTRYPOINT [ "sh", "./init.sh" ]
