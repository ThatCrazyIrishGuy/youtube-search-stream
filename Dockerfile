FROM mhart/alpine-node:4
RUN apk update && apk add ffmpeg
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD . /usr/src/app
RUN npm install

CMD [ "npm", "start" ]
EXPOSE 9090
