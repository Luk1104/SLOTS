FROM node:alpine AS build
WORKDIR /app
COPY . /app
RUN npm install && npm run build
FROM nginx:alpine
COPY --from=build /app/dist /app/dist
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
