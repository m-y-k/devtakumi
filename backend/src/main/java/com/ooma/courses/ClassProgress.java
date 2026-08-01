package com.ooma.courses;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "class_progress")
public class ClassProgress {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID userId;

    @Column(name = "class_session_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID classSessionId;

    @Column(name = "watched_recording", nullable = false)
    private boolean watchedRecording = false;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getClassSessionId() {
        return classSessionId;
    }

    public void setClassSessionId(UUID classSessionId) {
        this.classSessionId = classSessionId;
    }

    public boolean isWatchedRecording() {
        return watchedRecording;
    }

    public void setWatchedRecording(boolean watchedRecording) {
        this.watchedRecording = watchedRecording;
    }
}
