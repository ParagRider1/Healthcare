# Build Stage
FROM maven:3.8.5-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Production Stage
FROM eclipse-temurin:17-jre-alpine
COPY --from=builder /app/target/*.jar /app.jar
EXPOSE 8085
ENTRYPOINT ["java","-jar","/app.jar"]