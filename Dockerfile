FROM node:lts-alpine3.19
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "node", "./index.js"]