package com.example.hrautoshortlist.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//configuration class
@Configuration   //indicates that this class contains bean definition
public class OpenAPIConfig {
    //@Bean annotation tells spring to manage this object
    @Bean   //method return value becomes a Spring bean 
    public OpenAPI hrAutoShortlistAPI() {
        return new OpenAPI()                //Spring will call this method 
                .info(new Info()
                        .title("HR Auto Shortlist API")
                        .description("API documentation for the HR recruitment and auto-shortlisting system")
                        .version("1.0.0"));
    }
}
//Purpose: Configures Swagger/OpenAPI documentation for the REST API. Swagger UI available at /swagger-ui/index.html