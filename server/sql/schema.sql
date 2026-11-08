CREATE DATABASE IF NOT EXISTS uniconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uniconnect;

-- Academic structure
CREATE TABLE IF NOT EXISTS departments (
  dept_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS batches (
  batch_id INT AUTO_INCREMENT PRIMARY KEY,
  dept_id INT NOT NULL,
  batch_no INT NOT NULL,
  UNIQUE KEY uq_batch (dept_id, batch_no),
  FOREIGN KEY (dept_id) REFERENCES departments (dept_id)
);

CREATE TABLE IF NOT EXISTS sections (
  section_id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  name VARCHAR(10) NOT NULL,
  UNIQUE KEY uq_section (batch_id, name),
  FOREIGN KEY (batch_id) REFERENCES batches (batch_id)
);

-- Records stored by the admin for verification of students and teachers
CREATE TABLE IF NOT EXISTS verified_records (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('student', 'teacher') NOT NULL,
  id_no VARCHAR(30) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  dob DATE NOT NULL,
  dept_id INT NOT NULL,
  batch_id INT NULL,
  section_id INT NULL,
  position VARCHAR(50) NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uq_record (type, id_no),
  FOREIGN KEY (dept_id) REFERENCES departments (dept_id),
  FOREIGN KEY (batch_id) REFERENCES batches (batch_id),
  FOREIGN KEY (section_id) REFERENCES sections (section_id)
);

-- Accounts
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role ENUM('student', 'teacher', 'super_admin', 'dept_admin', 'exam_officer') NOT NULL,
  status ENUM('pending', 'active', 'deactivated') NOT NULL DEFAULT 'active',
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  record_id INT NOT NULL UNIQUE,
  id_no VARCHAR(30) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  dob DATE NOT NULL,
  dept_id INT NOT NULL,
  batch_id INT NOT NULL,
  section_id INT NOT NULL,
  id_card_path VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (record_id) REFERENCES verified_records(record_id),
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
  FOREIGN KEY (section_id) REFERENCES sections(section_id)
);

CREATE TABLE IF NOT EXISTS teachers (
  teacher_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  record_id INT NOT NULL UNIQUE,
  id_no VARCHAR(30) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  dob DATE NOT NULL,
  dept_id INT NOT NULL,
  position VARCHAR(50) NOT NULL,
  id_card_path VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (record_id) REFERENCES verified_records(record_id),
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- Sign-up in progress
CREATE TABLE IF NOT EXISTS signup_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  record_id INT NOT NULL,
  type ENUM('student', 'teacher') NOT NULL,
  phone VARCHAR(20) NOT NULL,
  id_card_path VARCHAR(255) NOT NULL,
  code_hash VARCHAR(100) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  code_expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES verified_records(record_id)
);

-- Forgot-password OTPs
CREATE TABLE IF NOT EXISTS password_resets (
  user_id INT PRIMARY KEY,
  otp_hash VARCHAR(100) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT NULL,
  action VARCHAR(50) NOT NULL,
  record VARCHAR(100) NULL,
  reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);