package com.spe.billingservice.controller;

import com.spe.billingservice.entity.Invoice;
import com.spe.billingservice.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Invoice>> getInvoicesByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(invoiceRepository.findByPatientId(patientId));
    }

    @PostMapping("/pay/{invoiceId}")
    public ResponseEntity<?> payInvoice(@PathVariable Long invoiceId) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            if ("PAID".equals(invoice.getStatus())) {
                return ResponseEntity.badRequest().body("Invoice is already paid");
            }
            invoice.setStatus("PAID");
            invoiceRepository.save(invoice);
            return ResponseEntity.ok(invoice);
        }
        return ResponseEntity.notFound().build();
    }
}
