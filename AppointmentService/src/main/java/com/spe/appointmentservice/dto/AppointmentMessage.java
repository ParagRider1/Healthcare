package com.spe.appointmentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentMessage {
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String appointmentDate;
    private String status;

    private String patientEmail;
    private String doctorEmail;
    private String doctorName;
    private String patientName;
}
