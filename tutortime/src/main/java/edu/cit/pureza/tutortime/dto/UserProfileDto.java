package edu.cit.pureza.tutortime.dto;

import edu.cit.pureza.tutortime.entity.User.UserRole;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfileDto {
    // ── User ─────────────────────────────
    private Long   id;
    private String email;
    private String firstName;
    private String lastName;
    private String middleInitial;
    private UserRole role;
    private String profilePhotoUrl;

    // ── Tutor-only (null for students) ───
    private String  bio;
    private String  expertise;
    private String  subjects;
    private String  location;
    private Double  rating;
    private Integer reviewCount;
    private Boolean isVerified;
}