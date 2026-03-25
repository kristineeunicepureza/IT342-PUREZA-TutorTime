package edu.cit.pureza.tutortime.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.cit.pureza.tutortime.entity.AvailabilitySlot;
import java.util.List;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {
    List<AvailabilitySlot> findByTutorId(Long tutorId);
    List<AvailabilitySlot> findByTutorIdAndIsBookedFalse(Long tutorId);
}
