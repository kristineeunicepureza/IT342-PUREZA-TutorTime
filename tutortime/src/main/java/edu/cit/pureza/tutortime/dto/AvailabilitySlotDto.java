package edu.cit.pureza.tutortime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilitySlotDto {
    private Long id;
    private String startTime;
    private String endTime;
    private String location;
    private Boolean isBooked;
    private String date;
    private String time;
}
