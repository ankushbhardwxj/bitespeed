FROM node:alpine

ENV DATABASE_URL postgres://ankush:ZwZfkQ3LcUh3d8HS4JBulzmO1eNCXgTv@dpg-cjb1328cfp5c739pekjg-a.oregon-postgres.render.com/contact_y5ua

WORKDIR /app

COPY package.json .

RUN npm install
COPY . .
RUN npx prisma generate
RUN npx prisma migrate dev
RUN ["npm", "run", "dev"]