# ---- Build stage ----
FROM node:20-bookworm-slim AS build
WORKDIR /app

ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci --no-audit --no-fund --ignore-scripts

COPY . .
RUN npm run build
RUN npm prune --omit=dev

# ---- Runtime stage ----
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS=--enable-source-maps

# Copy artifacts
COPY --chown=nonroot:nonroot --from=build /app/dist ./dist
COPY --chown=nonroot:nonroot --from=build /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot package*.json ./

COPY --chown=nonroot:nonroot healthcheck.mjs ./healthcheck.mjs
COPY --chown=nonroot:nonroot bootstrap.mjs ./bootstrap.mjs

USER nonroot:nonroot
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/usr/bin/node","/app/healthcheck.mjs"]

CMD ["bootstrap.mjs"]