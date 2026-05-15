package com.spe.appointmentservice.client;

import com.spe.appointmentservice.dto.DoctorDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "doctorservice", url = "http://doctorservice:8082")
public interface DoctorClient {

    @GetMapping("/api/doctors/{id}")
    DoctorDTO getDoctorById(@PathVariable Long id);
}
