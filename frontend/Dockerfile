# Frontend container
FROM node:trixie-slim

WORKDIR /app

COPY frontend/ /app

EXPOSE 5173

RUN npm install

CMD ["npm", "run", "dev", "--", "--host"]