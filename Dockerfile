FROM docker.io/library/node:20-alpine
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma

RUN prisma generate --schema=prisma/schema.prisma

COPY . .
CMD [ "pnpm", "run", "start" ]
