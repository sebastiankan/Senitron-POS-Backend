###############################################################################
###############################################################################
##                      _______ _____ ______ _____                           ##
##                     |__   __/ ____|  ____|  __ \                          ##
##                        | | | (___ | |__  | |  | |                         ##
##                        | |  \___ \|  __| | |  | |                         ##
##                        | |  ____) | |____| |__| |                         ##
##                        |_| |_____/|______|_____/                          ##
##                                                                           ##
## description     : Dockerfile for TsED Application                         ##
## author          : TsED team                                               ##
## date            : 2023-12-11                                              ##
## version         : 3.0                                                     ##
##                                                                           ##
###############################################################################
###############################################################################

ARG NODE_VERSION=20.11.0

### Stage 1: Build
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /opt

COPY package.json package-lock.json tsconfig.json tsconfig.base.json tsconfig.node.json .barrels.json .swcrc ./
RUN npm ci

COPY ./src ./src
COPY processes.config.cjs .
RUN npm run build

### Stage 2: Runtime
FROM node:${NODE_VERSION}-alpine AS runtime
ENV WORKDIR /opt
WORKDIR $WORKDIR

RUN apk update && apk add build-base git curl
RUN npm install -g pm2

COPY --from=build /opt .

RUN npm ci --omit=dev --ignore-scripts

EXPOSE 8081
ENV PORT 8081
ENV NODE_ENV production

CMD ["pm2-runtime", "--interpreter", "ts-node", "--interpreter-args", "-r tsconfig-paths/register", "src/index.ts"]