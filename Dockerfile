FROM docker.io/library/node:20-alpine
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

RUN prisma generate

COPY . .

RUN prisma migrate deploy

CMD [ "pnpm", "run", "start" ]
