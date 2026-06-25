FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies - cached unless package.json/bun.lock change
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install

# Generate Prisma client
COPY prisma ./prisma/
RUN bunx prisma generate

# Build stage - source is always freshly copied
FROM base AS builder
WORKDIR /app

# Force cache invalidation on every deploy
ARG RAILWAY_GIT_COMMIT_SHA=unknown
RUN echo "Building commit: $RAILWAY_GIT_COMMIT_SHA"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bunx prisma generate
RUN bun run build

# Production
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy additional node_modules needed for prisma CLI at runtime
COPY --from=deps /app/node_modules ./node_modules

# Copy seed file and entrypoint
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./entrypoint.sh"]