package com.spe.billingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private Double amount;
    private String status; // e.g. "PENDING", "PAID"
    private LocalDateTime issuedAt;
}
