package com.spe.billingservice.listener;

import com.spe.billingservice.entity.Invoice;
import com.spe.billingservice.repository.InvoiceRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class BillingRabbitMQListener {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @RabbitListener(queues = "appointment.billing.queue")
    public void listenAppointment(AppointmentMessage appointment) {
        if ("SCHEDULED".equals(appointment.getStatus())) {
            // Generate a $50 invoice for the consultation
            Invoice invoice = new Invoice();
            invoice.setAppointmentId(appointment.getAppointmentId());
            invoice.setPatientId(appointment.getPatientId());
            invoice.setDoctorId(appointment.getDoctorId());
            invoice.setAmount(50.00);
            invoice.setStatus("PENDING");
            invoice.setIssuedAt(LocalDateTime.now());
            
            invoiceRepository.save(invoice);
            System.out.println("Generated invoice for Appointment ID: " + appointment.getAppointmentId());
        } else if ("CANCELED".equals(appointment.getStatus())) {
            // Cancel any pending invoices
            invoiceRepository.findByAppointmentId(appointment.getAppointmentId()).forEach(invoice -> {
                if ("PENDING".equals(invoice.getStatus())) {
                    invoice.setStatus("CANCELED");
                    invoiceRepository.save(invoice);
                }
            });
        }
    }
}
