USE uniconnect;

INSERT INTO departments (code, name) VALUES
('CSE', 'Computer Science & Engineering'),
('EEE', 'Electrical & Electronic Engineering'),
('BBA', 'Business Administration');

INSERT INTO batches (dept_id, batch_no) VALUES (1, 60), (1, 61), (2, 58);
INSERT INTO sections (batch_id, name) VALUES (1, 'A'), (1, 'B'), (1, 'C'), (2, 'A'), (3, 'A');

-- Used only to test sign-up verification
INSERT INTO verified_records (type, id_no, full_name, email, dob, dept_id, batch_id, section_id, position) VALUES
('student', '232-115-001', 'Rahim Uddin', 'rahim.test@example.com', '2003-07-10', 1, 1, 3, NULL),
('student', '232-115-310', 'Tahmid Anwar Mobin', 'tahmidanwarmubin@example.com', '2003-01-01', 1, 1, 1, 0),
('student', '232-115-002', 'Karima Akter', 'karima.test@example.com', '2003-09-30', 1, 1, 1, NULL),
('teacher', 'T-1001', 'Sabbir Hossain', 'sabbir.test@example.com', '1988-01-20', 1, NULL, NULL, 'Senior Lecturer');