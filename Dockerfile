# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${PORT:-3000}

COPY --from=builder /app ./

EXPOSE ${PORT:-3000}

# Use shell form so $PORT is expanded
CMD ["sh", "-c", "npm run start"]
