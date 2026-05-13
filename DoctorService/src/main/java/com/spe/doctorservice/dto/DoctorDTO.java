package com.spe.doctorservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDTO {
    private String name;
    private String email;
    private String specialty;
    private String phone;
    private String address;

}

