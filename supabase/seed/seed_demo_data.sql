-- ============================================================================
-- InnovatMind School OS - Multi-Tenant Demo Seed Data
-- ============================================================================

-- 1. Create Demo Schools
INSERT INTO schools (id, code, name, school_type, email, phone, address, city, state, postal_code) VALUES
('a0000000-0000-0000-0000-000000000001', 'SCH-DELHI-001', 'Delhi Public Tech Academy', 'CBSE', 'admin@delhitech.edu.in', '+91 98765 43210', 'Plot 14, Knowledge Corridor, Sector 62', 'New Delhi', 'Delhi', '110001'),
('a0000000-0000-0000-0000-000000000002', 'SCH-BLR-002', 'Greenwood STEM International School', 'ICSE', 'contact@greenwoodstem.ac.in', '+91 98765 12345', '77 ITPL Main Road, Whitefield', 'Bengaluru', 'Karnataka', '560066')
ON CONFLICT (id) DO NOTHING;

-- 2. Create User Profiles
INSERT INTO profiles (id, school_id, role, first_name, last_name, email, phone) VALUES
-- Super Admin (InnovatMind Central)
('b0000000-0000-0000-0000-000000000001', NULL, 'SUPER_ADMIN', 'Vikram', 'Aditya', 'superadmin@innovatmind.com', '+91 99000 00001'),
-- School Admin (Delhi Public Tech Academy)
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SCHOOL_ADMIN', 'Ananya', 'Sharma', 'principal@delhitech.edu.in', '+91 99000 00002'),
-- Teacher (Delhi Public Tech Academy)
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'TEACHER', 'Rajesh', 'Kumar', 'rajesh.kumar@delhitech.edu.in', '+91 99000 00003'),
-- InnovatMind STEM Trainer
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'INNOVATMIND_TRAINER', 'Sneha', 'Patel', 'sneha.trainer@innovatmind.com', '+91 99000 00004'),
-- Student Profile
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'STUDENT', 'Aarav', 'Verma', 'aarav.v@student.delhitech.edu.in', '+91 99000 00005'),
-- Parent Profile
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'PARENT', 'Manoj', 'Verma', 'manoj.verma@parent.delhitech.edu.in', '+91 99000 00006')
ON CONFLICT (id) DO NOTHING;

-- 3. Academic Sessions
INSERT INTO academic_sessions (id, school_id, name, start_date, end_date, is_current) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Academic Year 2025-26', '2025-04-01', '2026-03-31', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Grades and Sections
INSERT INTO grades (id, school_id, name, numeric_level) VALUES
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Grade 6', 6),
('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Grade 7', 7),
('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Grade 8', 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, school_id, grade_id, name, class_teacher_id) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000006', 'Section A (Cyber)', 'b0000000-0000-0000-0000-000000000003'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000006', 'Section B (Robotics)', NULL)
ON CONFLICT (id) DO NOTHING;

-- 5. Student Enrollment
INSERT INTO students (id, school_id, profile_id, admission_number, roll_number, grade_id, section_id, session_id, dob, gender, blood_group, address, status, parent_profile_id) VALUES
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'ADM-2025-0101', '06-A-01', 'd0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '2013-05-14', 'MALE', 'O+', 'Flat 402, Tech Towers, Sector 62, New Delhi', 'ACTIVE', 'b0000000-0000-0000-0000-000000000006')
ON CONFLICT (id) DO NOTHING;

-- 6. Student Gamification State
INSERT INTO student_gamification (id, student_id, current_xp, current_level, coins, current_streak, last_activity_date) VALUES
('g0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 1450, 4, 320, 12, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- 7. Courses Catalog
INSERT INTO courses (id, title, slug, description, category, min_grade, max_grade, thumbnail_url, is_published) VALUES
('h0000000-0000-0000-0000-000000000001', 'Python Explorers: Interactive Game Logic', 'python-explorers-game-logic', 'Master core programming fundamentals, loops, and conditions by creating 2D arcade games.', 'Coding', 6, 8, '/images/courses/python-arcade.png', TRUE),
('h0000000-0000-0000-0000-000000000002', 'Autonomous Rover: Robotics & Sensors Lab', 'autonomous-rover-robotics', 'Simulate obstacle-avoiding rovers and learn motor control with virtual sensors.', 'Robotics', 6, 9, '/images/courses/robotics-rover.png', TRUE),
('h0000000-0000-0000-0000-000000000003', 'AI Sparks: Machine Learning Foundations', 'ai-sparks-foundations', 'Explore how AI perceives patterns, vision classification, and build interactive intelligent apps.', 'AI', 7, 10, '/images/courses/ai-sparks.png', TRUE)
ON CONFLICT (id) DO NOTHING;
