FROM node:23-alpine

WORKDIR /app

COPY . .

RUN corepack enable

RUN yarn install

RUN yarn build

RUN rm -rf /src

EXPOSE 8000

CMD [ "yarn", "start:prod" ]