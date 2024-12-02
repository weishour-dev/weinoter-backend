# ----------------------------
# 构建
# ----------------------------
FROM kooldev/node:21 AS build

WORKDIR /app

COPY package*.json .
RUN npm install --force

COPY . .
RUN npm run build

EXPOSE "${BACKEND_PORT:-3000}"

CMD [ "node", "dist/apps/ws/main.js" ]

