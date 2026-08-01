CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(32),
  password_hash VARCHAR(255),
  role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE courses (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_inr INT NOT NULL,
  duration_months INT NOT NULL,
  order_index INT NOT NULL,
  prerequisite_course_id CHAR(36),
  FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE months (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  month_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE weeks (
  id CHAR(36) PRIMARY KEY,
  month_id CHAR(36) NOT NULL,
  week_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  FOREIGN KEY (month_id) REFERENCES months(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE class_sessions (
  id CHAR(36) PRIMARY KEY,
  week_id CHAR(36) NOT NULL,
  global_class_number INT NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  day ENUM('MON', 'TUE', 'WED', 'THU', 'FRI') NOT NULL,
  scheduled_start DATETIME,
  scheduled_end DATETIME,
  notes_markdown MEDIUMTEXT,
  live_meeting_url VARCHAR(500),
  recording_provider VARCHAR(50),
  recording_provider_video_id VARCHAR(500),
  order_index INT NOT NULL,
  FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE questions (
  id CHAR(36) PRIMARY KEY,
  class_session_id CHAR(36),
  title VARCHAR(255) NOT NULL,
  difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
  statement_markdown MEDIUMTEXT NOT NULL,
  constraints JSON,
  examples JSON NOT NULL,
  starter_code_java MEDIUMTEXT,
  test_cases JSON NOT NULL,
  tags JSON,
  order_index INT NOT NULL,
  FOREIGN KEY (class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE enrollment_requests (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  course_id CHAR(36) NOT NULL,
  upi_reference VARCHAR(255) NOT NULL,
  payment_screenshot_url VARCHAR(500),
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  admin_note TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE enrollments (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  course_id CHAR(36) NOT NULL,
  status ENUM('ACTIVE', 'COMPLETED', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
  enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE (user_id, course_id)
) ENGINE=InnoDB;

CREATE TABLE assessments (
  id CHAR(36) PRIMARY KEY,
  week_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type ENUM('CODE', 'PROJECT_SUBMISSION') NOT NULL,
  opens_at DATETIME NOT NULL,
  closes_at DATETIME NOT NULL,
  duration_minutes INT,
  FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE assessment_questions (
  id CHAR(36) PRIMARY KEY,
  assessment_id CHAR(36) NOT NULL,
  question_id CHAR(36) NOT NULL,
  points INT NOT NULL DEFAULT 10,
  order_index INT NOT NULL,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id)
) ENGINE=InnoDB;

CREATE TABLE submissions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  question_id CHAR(36),
  assessment_id CHAR(36),
  language VARCHAR(50) NOT NULL DEFAULT 'java',
  code MEDIUMTEXT NOT NULL,
  verdict ENUM('ACCEPTED', 'WRONG_ANSWER', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'TLE', 'PENDING') NOT NULL DEFAULT 'PENDING',
  score INT,
  test_case_results JSON,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id)
) ENGINE=InnoDB;

CREATE TABLE project_submissions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  assessment_id CHAR(36) NOT NULL,
  repo_url VARCHAR(500),
  file_url VARCHAR(500),
  score INT,
  feedback TEXT,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  graded_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE class_progress (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  class_session_id CHAR(36) NOT NULL,
  watched_recording BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
  UNIQUE (user_id, class_session_id)
) ENGINE=InnoDB;

CREATE TABLE announcements (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB;

CREATE TABLE app_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value VARCHAR(500) NOT NULL
) ENGINE=InnoDB;
