package com.ooma.courses;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "class_sessions")
public class ClassSession {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @Column(name = "week_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID weekId;

    @Column(name = "global_class_number", nullable = false, unique = true)
    private int globalClassNumber;

    @Column(nullable = false, length = 500)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClassDay day;

    @Column(name = "scheduled_start")
    private Instant scheduledStart;

    @Column(name = "scheduled_end")
    private Instant scheduledEnd;

    @Column(name = "notes_markdown", columnDefinition = "MEDIUMTEXT")
    private String notesMarkdown;

    @Column(name = "live_meeting_url", length = 500)
    private String liveMeetingUrl;

    @Column(name = "recording_provider", length = 50)
    private String recordingProvider;

    @Column(name = "recording_provider_video_id", length = 500)
    private String recordingProviderVideoId;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getWeekId() {
        return weekId;
    }

    public void setWeekId(UUID weekId) {
        this.weekId = weekId;
    }

    public int getGlobalClassNumber() {
        return globalClassNumber;
    }

    public void setGlobalClassNumber(int globalClassNumber) {
        this.globalClassNumber = globalClassNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ClassDay getDay() {
        return day;
    }

    public void setDay(ClassDay day) {
        this.day = day;
    }

    public Instant getScheduledStart() {
        return scheduledStart;
    }

    public void setScheduledStart(Instant scheduledStart) {
        this.scheduledStart = scheduledStart;
    }

    public Instant getScheduledEnd() {
        return scheduledEnd;
    }

    public void setScheduledEnd(Instant scheduledEnd) {
        this.scheduledEnd = scheduledEnd;
    }

    public String getNotesMarkdown() {
        return notesMarkdown;
    }

    public void setNotesMarkdown(String notesMarkdown) {
        this.notesMarkdown = notesMarkdown;
    }

    public String getLiveMeetingUrl() {
        return liveMeetingUrl;
    }

    public void setLiveMeetingUrl(String liveMeetingUrl) {
        this.liveMeetingUrl = liveMeetingUrl;
    }

    public String getRecordingProvider() {
        return recordingProvider;
    }

    public void setRecordingProvider(String recordingProvider) {
        this.recordingProvider = recordingProvider;
    }

    public String getRecordingProviderVideoId() {
        return recordingProviderVideoId;
    }

    public void setRecordingProviderVideoId(String recordingProviderVideoId) {
        this.recordingProviderVideoId = recordingProviderVideoId;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }
}
