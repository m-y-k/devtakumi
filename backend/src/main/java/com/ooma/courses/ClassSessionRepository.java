package com.ooma.courses;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ClassSessionRepository extends JpaRepository<ClassSession, UUID> {

    List<ClassSession> findByWeekIdOrderByOrderIndexAsc(UUID weekId);

    @Query("SELECT COUNT(c) FROM ClassSession c WHERE c.weekId IN :weekIds")
    long countByWeekIdIn(@Param("weekIds") Collection<UUID> weekIds);
}
