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

# Install dependencies for native builds
RUN apk add --no-cache build-base python3

# Copy only necessary files first
COPY package*.json tsconfig*.json .barrels.json .swcrc ./

RUN npm ci

# Copy the rest of the source code
COPY ./src ./src

# Build the project (assumes you use tsc or swc in `npm run build`)
RUN npm run build



### Stage 2: Runtime
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /opt

# Install PM2 globally
RUN apk add --no-cache curl && npm install -g pm2

# Copy built output & config files from the build stage
COPY --from=build /opt/dist ./dist
COPY --from=build /opt/package*.json ./
COPY --from=build /opt/processes.config.cjs ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts

EXPOSE 8081
ENV PORT=8081
ENV NODE_ENV=production

CMD ["pm2-runtime", "start", "processes.config.cjs", "--env", "production"]