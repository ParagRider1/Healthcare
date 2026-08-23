FROM eclipse-temurin:17-jre-alpine
COPY target/ApiGateway-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8765
ENTRYPOINT ["java","-jar","/app.jar"]