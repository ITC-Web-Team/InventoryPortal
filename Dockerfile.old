# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (caching)
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy configuration files
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY next.config.js ./

# Copy the rest of the application
COPY . .

# Create .env file from build args
ARG DATABASE_URL
ARG NEXT_PUBLIC_SSO_URL
ARG NEXT_PUBLIC_SSO_PROJECT_ID
ARG ADMIN_PASSWORD

RUN echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env && \
  echo "NEXT_PUBLIC_SSO_URL=\"${NEXT_PUBLIC_SSO_URL}\"" >> .env && \
  echo "NEXT_PUBLIC_SSO_PROJECT_ID=\"${NEXT_PUBLIC_SSO_PROJECT_ID}\"" >> .env && \
  echo "ADMIN_PASSWORD=\"${ADMIN_PASSWORD}\"" >> .env

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/styles ./styles

# Expose the port the app runs on
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
