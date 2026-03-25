package edu.cit.pureza.tutortime.controller;

import edu.cit.pureza.tutortime.dto.ApiResponse;
import edu.cit.pureza.tutortime.dto.BookingDto;
import edu.cit.pureza.tutortime.entity.Booking;
import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.repository.BookingRepository;
import edu.cit.pureza.tutortime.repository.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class BookingController {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private UserRepository    userRepository;

    // ── Create booking (STUDENT) ──────────────────────────────────────────────
    @PostMapping
    public ApiResponse<Object> createBooking(@RequestBody CreateBookingRequest request) {
        try {
            String email   = currentEmail();
            User   student = findUser(email);
            User   tutor   = userRepository.findById(request.getTutorId())
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            LocalDateTime scheduled = LocalDateTime.parse(request.getScheduledTime(), fmt);

            Booking booking = Booking.builder()
                    .student(student)
                    .tutor(tutor)
                    .subject(request.getSubject())
                    .notes(request.getNotes())
                    .scheduledTime(scheduled)
                    .build();

            return ApiResponse.success(toDto(bookingRepository.save(booking)));
        } catch (Exception e) {
            return ApiResponse.error("BOOKING_ERROR", e.getMessage());
        }
    }

    // ── Student: own bookings ─────────────────────────────────────────────────
    @GetMapping("/my-bookings")
    public ApiResponse<Object> getMyBookings() {
        try {
            User user = findUser(currentEmail());
            List<BookingDto> list = bookingRepository.findByStudentId(user.getId())
                    .stream().map(this::toDto).toList();
            return ApiResponse.success(list);
        } catch (Exception e) {
            return ApiResponse.error("BOOKING_ERROR", e.getMessage());
        }
    }

    // ── Tutor: bookings assigned to me ────────────────────────────────────────
    @GetMapping("/tutor-bookings")
    public ApiResponse<Object> getTutorBookings() {
        try {
            User tutor = findUser(currentEmail());
            List<BookingDto> list = bookingRepository.findByTutorId(tutor.getId())
                    .stream().map(this::toDto).toList();
            return ApiResponse.success(list);
        } catch (Exception e) {
            return ApiResponse.error("BOOKING_ERROR", e.getMessage());
        }
    }

    // ── Admin: all bookings ───────────────────────────────────────────────────
    @GetMapping("/all")
    public ApiResponse<Object> getAllBookings() {
        try {
            List<BookingDto> list = bookingRepository.findAll()
                    .stream().map(this::toDto).toList();
            return ApiResponse.success(list);
        } catch (Exception e) {
            return ApiResponse.error("BOOKING_ERROR", e.getMessage());
        }
    }

    // ── Cancel booking ────────────────────────────────────────────────────────
    @PatchMapping("/{id}/cancel")
    public ApiResponse<Object> cancelBooking(@PathVariable Long id) {
        try {
            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            return ApiResponse.success(toDto(bookingRepository.save(booking)));
        } catch (Exception e) {
            return ApiResponse.error("BOOKING_ERROR", e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private String currentEmail() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return (p instanceof UserDetails ud) ? ud.getUsername() : p.toString();
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private BookingDto toDto(Booking b) {
        return BookingDto.builder()
                .id(b.getId())
                .studentId(b.getStudent().getId())
                .studentName(b.getStudent().getFirstName() + " " + b.getStudent().getLastName())
                .tutorId(b.getTutor().getId())
                .tutorName(b.getTutor().getFirstName() + " " + b.getTutor().getLastName())
                .subject(b.getSubject())
                .notes(b.getNotes())
                .status(b.getStatus().toString())
                .scheduledTime(b.getScheduledTime())
                .createdAt(b.getCreatedAt())
                .build();
    }
}

@Data
class CreateBookingRequest {
    private Long   tutorId;
    private String subject;
    private String notes;
    private String scheduledTime;
}