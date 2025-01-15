### Dev ###
FROM node:alpine AS build
#USER node
WORKDIR /usr/src/app/api
ENV NODE_ENV=development
COPY api .
RUN npm i

CMD ["npm","run", "start:dev"]
