# Frontend container
FROM node:trixie-slim
COPY . /app
WORKDIR /app
RUN npm install && npm run build

FROM nginx:trixie
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
