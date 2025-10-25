FROM node:trixie-slim

WORKDIR /app

COPY frontend/ /app

CMD npm install && npm run dev -- --host

EXPOSE 5173

FROM python:3-10-slim

WORKDIR /app

COPY backend/ /app

RUN pip install --no-cache-dir -r -requirements.txt

EXPOSE 5000

CMD ["python", "app.py"]
