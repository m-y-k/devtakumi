package com.devtakumi.courses;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "weeks")
public class Week {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(columnDefinition = "CHAR(36)")
    private UUID id;

    @Column(name = "month_id", nullable = false, columnDefinition = "CHAR(36)")
    private UUID monthId;

    @Column(name = "week_number", nullable = false)
    private int weekNumber;

    @Column(nullable = false)
    private String title;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getMonthId() {
        return monthId;
    }

    public void setMonthId(UUID monthId) {
        this.monthId = monthId;
    }

    public int getWeekNumber() {
        return weekNumber;
    }

    public void setWeekNumber(int weekNumber) {
        this.weekNumber = weekNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
