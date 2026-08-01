package com.ooma.courses;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MonthRepository extends JpaRepository<Month, UUID> {

    List<Month> findByCourseIdOrderByMonthNumberAsc(UUID courseId);
}
