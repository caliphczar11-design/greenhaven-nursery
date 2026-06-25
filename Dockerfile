FROM oven/bun:1-alpine AS base
WORKDIR /app

# Stage 1: Install dependencies (cached unless package.json changes)
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install

# Stage 2: Build — source is copied FIRST to bust cache on ANY code change
FROM base AS builder
WORKDIR /app

# IMPORTANT: Copy ALL source code BEFORE node_modules.
# This guarantees Railway cannot serve stale cached source code.
COPY . .

# Now overlay pre-built node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

RUN bunx prisma generate
RUN bun run build

# Stage 3: Minimal production image
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./entrypoint.sh"]