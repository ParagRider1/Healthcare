package com.spe.notificationservice.listener;

import com.spe.notificationservice.model.AppointmentStatus;

import com.spe.notificationservice.service.EmailService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AppointmentListener {

    @Autowired
    private EmailService emailService;

    @RabbitListener(queues = "appointment.notification.queue")
    public void listenAppointment(AppointmentMessage appointment) {
        AppointmentStatus status = AppointmentStatus.valueOf(appointment.getStatus());

        System.out.print(appointment.getPatientEmail());
        System.out.print(appointment.getDoctorEmail());

        String subject;
        String body;
        String to = appointment.getPatientEmail();

        String dateStr = (appointment.getAppointmentDate() != null) ? appointment.getAppointmentDate().toString().replace("T", " at ") : "a pending time";

        if (status == AppointmentStatus.SCHEDULED) {
            subject = "Appointment Scheduled";
            body = "Hi " + appointment.getPatientName() + ",\n\nYour appointment with Dr. " + appointment.getDoctorName() +
                    " is scheduled successfully for " + dateStr + ".\n\nThank you for choosing MediConnect!";
        } else {
            subject = "Appointment Cancelled";
            body ="Hi " + appointment.getPatientName() + ",\n\nYour appointment with Dr. " + appointment.getDoctorName() +
                    " scheduled for " + dateStr + " has been cancelled.\n\nWe apologize for the inconvenience.";
        }
        emailService.sendEmail(to, subject, body);


        to = appointment.getDoctorEmail();

        if (status == AppointmentStatus.SCHEDULED) {
            subject = "New Appointment Scheduled";
            body = "Hi Dr. " + appointment.getDoctorName() + ",\n\nA new appointment with patient " + appointment.getPatientName() +
                    " is scheduled successfully for " + dateStr + ".\n\nPlease check your dashboard for details.";
        } else {
            subject = "Appointment Cancelled";
            body = "Hi Dr. " + appointment.getDoctorName() + ",\n\nYour appointment with patient " + appointment.getPatientName() +
                    " scheduled for " + dateStr + " has been cancelled.";
        }
        emailService.sendEmail(to, subject, body);

    }
}
