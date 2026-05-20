FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm i --no-audit --no-fund || true
COPY . .
EXPOSE 8088
CMD ["npm","run","start"]
