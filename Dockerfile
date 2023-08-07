FROM docker.io/library/node:20-alpine
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

RUN ls

RUN npx prisma migrate deploy --schema ./prisma/schema.prisma

COPY . .
CMD [ "pnpm", "run", "start" ]
