FROM node:18-alpine

WORKDIR /nam/bookingcinematicket

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]
