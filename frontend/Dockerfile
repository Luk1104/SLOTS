# Frontend container
FROM node:alpine
COPY . /app
WORKDIR /app
RUN npm install && npm run build
WORKDIR /app/dist
RUN apk update && apk add nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
