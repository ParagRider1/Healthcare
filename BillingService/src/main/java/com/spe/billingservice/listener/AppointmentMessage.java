package com.spe.billingservice.listener;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentMessage {
    private Long appointmentId;
    private Long doctorId;
    private Long patientId;
    private String appointmentDate;
    private String status;
    private String patientEmail;
    private String doctorEmail;
    private String doctorName;
    private String patientName;
}
