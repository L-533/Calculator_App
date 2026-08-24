FROM node:20 AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/. .
RUN npm run build

FROM golang:1.24.4-alpine AS backend-build
WORKDIR /app
ENV GOTOOLCHAIN=auto
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/. .
RUN go build -o main ./cmd/server

FROM alpine:3.20.1 AS prod
WORKDIR /app
COPY --from=backend-build /app/main ./main
COPY --from=frontend-build /frontend/dist ./static
ENV STATIC_DIR=/app/static

CMD ["./main"]
