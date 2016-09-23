FROM node:argon

RUN apt-get update && apt-get install libav-tools -y
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD . /usr/src/app
RUN npm install

CMD [ "npm", "start" ]
EXPOSE 9090
