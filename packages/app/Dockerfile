# ─────────────────────────────────────────────
# Stage 1 – dependencies & build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Avoid re-installing deps unless package files change
COPY package*.json  ./
RUN npm install --frozen-lockfile

# Copy the actual source
COPY . .

# Allow switching between “dev” and “prod” with --target in docker-compose
ARG BUILD_MODE=production   # default
ENV BUILD_MODE=${BUILD_MODE}

# Production build (vite build) if BUILD_MODE=production
RUN if [ "$BUILD_MODE" = "production" ]; then \
      npm run build ; \
    fi

# ─────────────────────────────────────────────
# Stage 2 – runtime
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Copy source (for dev) or dist/ (for prod)
ARG BUILD_MODE=production
ENV BUILD_MODE=${BUILD_MODE}

COPY --from=builder /app .

# ------------- DEV -------------
# `npm run start` starts the Vite server (port 3000)
# ------------- PROD ------------
# A tiny static server (e.g. serve) will serve /dist

RUN if [ "$BUILD_MODE" = "production" ]; then \
      npm install -g serve ; \
    fi

EXPOSE 3000

CMD \
  if [ "$BUILD_MODE" = "production" ]; then \
      serve -s dist -l 3000 ; \
    else \
      npm run start ; \
    fi