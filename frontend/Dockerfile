FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Bake only the API origin into CSP so production does not allow arbitrary HTTPS connections.
RUN node -e "const fs = require('node:fs'); const origin = new URL(process.env.VITE_API_URL).origin; const config = fs.readFileSync('nginx.conf', 'utf8').replace('__CSP_API_ORIGIN__', origin); fs.writeFileSync('/app/nginx.rendered.conf', config);"

FROM nginx:alpine

COPY --from=build /app/nginx.rendered.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
