# Frontend container
FROM node:trixie-slim

WORKDIR /app

COPY . /app

EXPOSE 5173

RUN apt update && apt install -y python3
RUN npm install && npm run build

WORKDIR /app/dist

CMD ["python3", "-m", "http.server", "5173"]
