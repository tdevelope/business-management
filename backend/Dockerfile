FROM node:20-bullseye AS builder
WORKDIR /app

# Install system dependencies with better mirror fallback
RUN apt-get update -o Acquire::http::Timeout=30 -o Acquire::https::Timeout=30 && \
    apt-get install -y --no-install-recommends openssl ca-certificates curl && \
    rm -rf /var/lib/apt/lists/* && \
    update-ca-certificates || true

# Install NETFREE/custom certificate if provided
COPY certs/ca.crt /usr/local/share/ca-certificates/netfree.crt
RUN if [ -f /usr/local/share/ca-certificates/netfree.crt ]; then \
      chmod 644 /usr/local/share/ca-certificates/netfree.crt && \
      update-ca-certificates || true; \
    fi

# Set SSL environment variables for npm and Node
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    NODE_TLS_REJECT_UNAUTHORIZED=0 \
    NPM_CONFIG_CAFILE=/etc/ssl/certs/ca-certificates.crt

COPY package.json package-lock.json* ./
RUN npm ci

COPY . ./

# Build the app (Prisma generate will run in entrypoint at runtime to avoid SSL issues during build)
RUN npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app

# Install only runtime system dependencies with timeout
RUN apt-get update -o Acquire::http::Timeout=30 -o Acquire::https::Timeout=30 && \
    apt-get install -y --no-install-recommends openssl ca-certificates postgresql-client && \
    rm -rf /var/lib/apt/lists/* && \
    update-ca-certificates || true

# Install NETFREE/custom certificate if provided
COPY certs/ca.crt /usr/local/share/ca-certificates/netfree.crt
RUN if [ -f /usr/local/share/ca-certificates/netfree.crt ]; then \
      chmod 644 /usr/local/share/ca-certificates/netfree.crt && \
      update-ca-certificates || true; \
    fi

# Set SSL environment variables
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    NODE_TLS_REJECT_UNAUTHORIZED=0 \
    NPM_CONFIG_CAFILE=/etc/ssl/certs/ca-certificates.crt \
    NODE_ENV=production

# Copy package and production node_modules from builder

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package-lock.json ./package-lock.json

# copy entrypoint (will be added) which installs/trusts mounted cert if present and starts the app
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]

