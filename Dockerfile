# This is the main production Dockerfile.
# It depends on medplum-server.tar.gz which is created by scripts/deploy-server.sh.
# This is a production ready image.
# It does not include any development dependencies.

# Builds multiarch docker images
# https://docs.docker.com/build/building/multi-platform/
# https://www.docker.com/blog/multi-arch-build-and-images-the-simple-way/

# Supported architectures:
# linux/amd64, linux/arm64, linux/arm/v7
# https://github.com/docker-library/official-images#architectures-other-than-amd64

FROM node:20-slim

ENV NODE_ENV=production

WORKDIR /app

# Add the application files
ADD . .

# Install dependencies, create non-root user, and set permissions in one layer
RUN npm ci --maxsockets 1 && \
  groupadd -r afyahewani && \
  useradd -r -g afyahewani afyahewani && \
  mkdir -p /app/binary && \
  chown -R afyahewani:afyahewani /app

RUN npm install -g ts-node-dev

EXPOSE 8103

# Switch to the non-root user
USER afyahewani

ENTRYPOINT [ "ts-node-dev", "--poll", "--respawn", "--transpile-only", "--require", "./packages/server/src/otel/instrumentation.ts", "./packages/server/src/index.ts" ]
