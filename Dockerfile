FROM node:16.15-slim

WORKDIR /app
COPY ./src /app/src
COPY ./package.json /app/
RUN npm install --save-prod

CMD ["npm", "run", "start"]
