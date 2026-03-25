package edu.cit.pureza.tutortime.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import edu.cit.pureza.tutortime.entity.AvailabilitySlot;
import edu.cit.pureza.tutortime.entity.User;
import edu.cit.pureza.tutortime.repository.AvailabilitySlotRepository;
import edu.cit.pureza.tutortime.repository.UserRepository;
import edu.cit.pureza.tutortime.dto.ApiResponse;
import edu.cit.pureza.tutortime.dto.AvailabilitySlotDto;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AvailabilityController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvailabilitySlotRepository availabilitySlotRepository;

    @PostMapping
    public ApiResponse<Object> addAvailabilitySlot(@RequestBody CreateAvailabilityRequest request) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = (principal instanceof String) ? (String) principal : ((UserDetails) principal).getUsername();

            User tutor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (!tutor.getRole().equals(User.UserRole.TUTOR)) {
                return ApiResponse.error("INVALID_ROLE", "Only tutors can add availability");
            }

            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                LocalDateTime startTime = LocalDateTime.parse(request.getStartTime(), formatter);
                LocalDateTime endTime = LocalDateTime.parse(request.getEndTime(), formatter);

                AvailabilitySlot slot = AvailabilitySlot.builder()
                        .tutor(tutor)
                        .startTime(startTime)
                        .endTime(endTime)
                        .location(request.getLocation())
                        .isBooked(false)
                        .build();

                AvailabilitySlot savedSlot = availabilitySlotRepository.save(slot);

                return ApiResponse.success(mapSlotToDTO(savedSlot));
            } catch (Exception e) {
                return ApiResponse.error("DATE_PARSE_ERROR", "Invalid date format: " + e.getMessage());
            }
        } catch (Exception e) {
            return ApiResponse.error("AVAILABILITY_ERROR", e.getMessage());
        }
    }

    @GetMapping("/my-slots")
    public ApiResponse<List<Object>> getMyAvailabilitySlots() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = (principal instanceof String) ? (String) principal : ((UserDetails) principal).getUsername();

            User tutor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<AvailabilitySlot> slots = availabilitySlotRepository.findByTutorId(tutor.getId());

            return ApiResponse.success(
                slots.stream()
                    .map(this::mapSlotToDTO)
                    .collect(Collectors.toList())
            );
        } catch (Exception e) {
            return ApiResponse.error("AVAILABILITY_ERROR", e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteAvailabilitySlot(@PathVariable Long id) {
        try {
            AvailabilitySlot slot = availabilitySlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

            availabilitySlotRepository.deleteById(id);

            return ApiResponse.success("Slot deleted successfully");
        } catch (Exception e) {
            return ApiResponse.error("AVAILABILITY_ERROR", e.getMessage());
        }
    }

    private Object mapSlotToDTO(AvailabilitySlot slot) {
        return AvailabilitySlotDto.builder()
                .id(slot.getId())
                .startTime(slot.getStartTime().toString())
                .endTime(slot.getEndTime().toString())
                .location(slot.getLocation())
                .isBooked(slot.getIsBooked())
                .date(slot.getStartTime().toLocalDate().toString())
                .time(slot.getStartTime().toLocalTime().toString())
                .build();
    }
}

@Data
class CreateAvailabilityRequest {
    private String startTime;
    private String endTime;
    private String location;
}
