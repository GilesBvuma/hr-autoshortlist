package com.example.hrautoshortlist;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//this is the main appliation class 
@SpringBootApplication // Enables Auto-configuration, component scanning etc . Combines: @Configuration, @EnableAutoConfiguration, @ComponentScan
public class HrAutoshortlistApplication {

	public static void main(String[] args) {
		SpringApplication.run(HrAutoshortlistApplication.class, args);
	} // starts the springboot application

}
// Start Point: HrAutoshortlistApplication.java - Bootstraps the Spring Boot
// application
// this is the main entry point of the application . this is where the
// springboot app starts