package com.devtakumi.enrollment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRequestRepository extends JpaRepository<EnrollmentRequest, UUID> {
    List<EnrollmentRequest> findByStatusOrderByCreatedAtDesc(EnrollmentRequestStatus status);
}
