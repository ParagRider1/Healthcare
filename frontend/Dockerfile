# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG GATEWAY_URL=http://api-gateway:8765
ENV GATEWAY_URL=$GATEWAY_URL
RUN npm run build

# Production Stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Note: GATEWAY_URL is hardcoded as http://gateway:8765 via Kubernetes service name so no ENV passing is strictly needed
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
CMD echo "==================================================================" && \
    echo "🚀 HEALTHCARE FRONTEND ACTIVE" && \
    echo "👉 Open in your laptop's browser at: http://192.168.49.2:30001" && \
    echo "==================================================================" && \
    node server.js
