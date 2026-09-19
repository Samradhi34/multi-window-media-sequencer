# Multi-Stage Dockerfile for Multi-Window Media Sequencer
# Stage 1: Build Vite React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --prefer-offline || npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot Executable JAR with embedded static frontend
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app
COPY pom.xml ./
COPY src ./src
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Production JDK 21 Lightweight Runtime Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root security user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=backend-builder /app/target/*.jar app.jar

EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
