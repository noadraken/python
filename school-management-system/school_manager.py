import sys
import os
import json
import hashlib
import sqlite3
from datetime import datetime

DB_FILE = "school.db"

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def get_db_connection():
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master LIMIT 1")
        cursor.fetchone()
        return conn
    except (sqlite3.DatabaseError, sqlite3.OperationalError) as e:
        err_msg = str(e).lower()
        if "malformed" in err_msg or "corrupt" in err_msg:
            print("Detected corrupted or malformed SQLite database. Recreating database...", file=sys.stderr)
            try:
                conn.close()
            except:
                pass
            if os.path.exists(DB_FILE):
                try:
                    os.remove(DB_FILE)
                except Exception as del_err:
                    print(f"Failed to remove corrupted DB file: {del_err}", file=sys.stderr)
            new_conn = sqlite3.connect(DB_FILE)
            new_conn.execute("PRAGMA foreign_keys = ON")
            init_db(new_conn)
            return new_conn
        else:
            raise

def init_db(conn):
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        teacher_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
    )""")
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
    )""")
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        score REAL NOT NULL,
        graded_by INTEGER NOT NULL,
        graded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY(graded_by) REFERENCES users(id) ON DELETE CASCADE
    )""")
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_data_base64 TEXT NOT NULL,
        class_id INTEGER NOT NULL,
        uploaded_by INTEGER NOT NULL,
        uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY(uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    )""")
    conn.commit()

    # Seed Admin
    admin_email = "admin@school.com"
    cursor.execute("SELECT id FROM users WHERE email = ?", (admin_email,))
    admin = cursor.fetchone()
    if not admin:
        cursor.execute("""
        INSERT INTO users (email, password_hash, role, name)
        VALUES (?, ?, ?, ?)
        """, (admin_email, hash_password("admin_secure_pass"), "admin", "Principal Arthur Vance"))
        conn.commit()
        print("Seeded admin account.", file=sys.stderr)

    # Seed 5 Teachers
    teachers_data = [
        ("teacher1@school.com", "teacher1_pass", "Dr. Susan Vance", "Advanced Calculus"),
        ("teacher2@school.com", "teacher2_pass", "Prof. Robert Carter", "Introductory Physics"),
        ("teacher3@school.com", "teacher3_pass", "Ms. Clara Hughes", "English Literature"),
        ("teacher4@school.com", "teacher4_pass", "Mr. Alan Turing", "Web Development"),
        ("teacher5@school.com", "teacher5_pass", "Mrs. Elizabeth Bennett", "Modern World History")
    ]
    
    for email, password, name, class_name in teachers_data:
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        t_row = cursor.fetchone()
        if not t_row:
            cursor.execute("""
            INSERT INTO users (email, password_hash, role, name)
            VALUES (?, ?, ?, ?)
            """, (email, hash_password(password), "teacher", name))
            teacher_id = cursor.lastrowid
            conn.commit()
            print(f"Seeded teacher: {name} ({email})", file=sys.stderr)
        else:
            teacher_id = t_row[0]
        
        # Seed a default class for this teacher
        cursor.execute("SELECT id FROM classes WHERE teacher_id = ?", (teacher_id,))
        existing_class = cursor.fetchone()
        if not existing_class:
            class_code = email.split('@')[0].upper() + "101"
            cursor.execute("""
            INSERT INTO classes (name, code, description, teacher_id)
            VALUES (?, ?, ?, ?)
            """, (class_name, class_code, f"Standard curriculum for {class_name}. Managed by {name}.", teacher_id))
            conn.commit()
            print(f"Seeded class: {class_name} with code {class_code}", file=sys.stderr)

    # Seed some sample students
    students_data = [
        ("student1@school.com", "student1_pass", "Alice Smith"),
        ("student2@school.com", "student2_pass", "Bob Jones"),
        ("student3@school.com", "student3_pass", "Charlie Brown")
    ]
    
    student_ids = []
    for email, password, name in students_data:
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        s_row = cursor.fetchone()
        if not s_row:
            cursor.execute("""
            INSERT INTO users (email, password_hash, role, name)
            VALUES (?, ?, ?, ?)
            """, (email, hash_password(password), "student", name))
            student_id = cursor.lastrowid
            conn.commit()
            print(f"Seeded student: {name} ({email})", file=sys.stderr)
        else:
            student_id = s_row[0]
        student_ids.append(student_id)

    # Seed enrollments and sample grades
    cursor.execute("SELECT id, teacher_id FROM classes")
    db_classes = cursor.fetchall()
    if db_classes:
        for s_idx, s_id in enumerate(student_ids):
            # Enroll each student in 2 classes
            enrolled_classes = [
                db_classes[s_idx % len(db_classes)],
                db_classes[(s_idx + 1) % len(db_classes)]
            ]
            for cls_id, teacher_id in enrolled_classes:
                cursor.execute("SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?", (s_id, cls_id))
                if not cursor.fetchone():
                    cursor.execute("""
                    INSERT INTO enrollments (student_id, class_id)
                    VALUES (?, ?)
                    """, (s_id, cls_id))
                    conn.commit()
                
                # Seed grades
                grades_to_add = [
                    ("Homework 1", 75.0 + (s_idx * 7 + cls_id * 3) % 25),
                    ("Midterm Exam", 60.0 + (s_idx * 13 + cls_id * 5) % 40),
                    ("Final Project", 70.0 + (s_idx * 9 + cls_id * 11) % 30)
                ]
                for title, score in grades_to_add:
                    cursor.execute("""
                    SELECT id FROM grades WHERE student_id = ? AND class_id = ? AND title = ?
                    """, (s_id, cls_id, title))
                    if not cursor.fetchone():
                        cursor.execute("""
                        INSERT INTO grades (student_id, class_id, title, score, graded_by)
                        VALUES (?, ?, ?, ?, ?)
                        """, (s_id, cls_id, title, score, teacher_id))
                        conn.commit()

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No arguments provided"}))
        return

    try:
        req = json.loads(sys.argv[1])
    except Exception as e:
        print(json.dumps({"error": f"Invalid JSON argument: {str(e)}"}))
        return

    action = req.get("action")
    try:
        conn = get_db_connection()
    except (sqlite3.DatabaseError, sqlite3.OperationalError) as e:
        print(f"Force-healing database: {e}", file=sys.stderr)
        if os.path.exists(DB_FILE):
            try:
                os.remove(DB_FILE)
            except:
                pass
        conn = sqlite3.connect(DB_FILE)
        conn.execute("PRAGMA foreign_keys = ON")
        init_db(conn)
    
    try:
        if action == "init":
            init_db(conn)
            print(json.dumps({"status": "success", "message": "Database initialized successfully"}))

        elif action == "login":
            email = req.get("email")
            password = req.get("password")
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, password_hash, role, name FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row and verify_password(password, row[2]):
                print(json.dumps({
                    "status": "success",
                    "user": {
                        "id": row[0],
                        "email": row[1],
                        "role": row[3],
                        "name": row[4]
                    }
                }))
            else:
                print(json.dumps({"status": "error", "message": "Invalid email or password"}))

        elif action == "check_user":
            email = req.get("email")
            cursor = conn.cursor()
            cursor.execute("SELECT id, role, name FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                print(json.dumps({
                    "status": "exists",
                    "user": {
                        "id": row[0],
                        "role": row[1],
                        "name": row[2]
                    }
                }))
            else:
                print(json.dumps({"status": "not_exists"}))

        elif action == "gmail_login_or_signup":
            email = req.get("email")
            name = req.get("name")
            role = req.get("role", "student")
            
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, role, name FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if not user:
                random_pass = os.urandom(24).hex()
                cursor.execute("""
                INSERT INTO users (email, password_hash, role, name)
                VALUES (?, ?, ?, ?)
                """, (email, hash_password(random_pass), role, name))
                conn.commit()
                u_id = cursor.lastrowid
                user_obj = {"id": u_id, "email": email, "role": role, "name": name}
                message = "Gmail Sign-up Successful"
            else:
                user_obj = {"id": user[0], "email": user[1], "role": user[2], "name": user[3]}
                message = "Gmail Log-in Successful"
            
            print(json.dumps({
                "status": "success",
                "message": message,
                "user": user_obj
            }))

        elif action == "signup":
            email = req.get("email")
            password = req.get("password")
            role = req.get("role", "student")
            name = req.get("name")
            
            if role not in ["student", "admin"]:
                print(json.dumps({"status": "error", "message": "Only students and admins can sign up directly"}))
                return
                
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                print(json.dumps({"status": "error", "message": "User with this email already exists"}))
                return
                
            cursor.execute("""
            INSERT INTO users (email, password_hash, role, name)
            VALUES (?, ?, ?, ?)
            """, (email, hash_password(password), role, name))
            conn.commit()
            u_id = cursor.lastrowid
            
            print(json.dumps({
                "status": "success",
                "user": {
                    "id": u_id,
                    "email": email,
                    "role": role,
                    "name": name
                }
            }))

        elif action == "add_teacher":
            email = req.get("email")
            password = req.get("password")
            name = req.get("name")
            
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                print(json.dumps({"status": "error", "message": "Teacher with this email already exists"}))
                return
                
            cursor.execute("""
            INSERT INTO users (email, password_hash, role, name)
            VALUES (?, ?, ?, ?)
            """, (email, hash_password(password), "teacher", name))
            conn.commit()
            t_id = cursor.lastrowid
            
            print(json.dumps({
                "status": "success",
                "teacher": {
                    "id": t_id,
                    "email": email,
                    "name": name
                }
            }))

        elif action == "get_teachers":
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, name, created_at FROM users WHERE role = 'teacher'")
            teachers = []
            for row in cursor.fetchall():
                teachers.append({
                    "id": row[0],
                    "email": row[1],
                    "name": row[2],
                    "created_at": row[3]
                })
            print(json.dumps({
                "status": "success",
                "teachers": teachers
            }))

        elif action == "get_students":
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, name, created_at FROM users WHERE role = 'student'")
            students = []
            for row in cursor.fetchall():
                students.append({
                    "id": row[0],
                    "email": row[1],
                    "name": row[2],
                    "created_at": row[3]
                })
            print(json.dumps({
                "status": "success",
                "students": students
            }))

        elif action == "delete_user":
            user_id = req.get("user_id")
            cursor = conn.cursor()
            cursor.execute("SELECT role, name FROM users WHERE id = ?", (user_id,))
            user_row = cursor.fetchone()
            if not user_row:
                print(json.dumps({"status": "error", "message": "User not found"}))
                return
            
            role = user_row[0]
            if role == "admin":
                print(json.dumps({"status": "error", "message": "Admin account cannot be deleted"}))
                return

            cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()
            print(json.dumps({
                "status": "success",
                "message": f"Successfully removed {role}: {user_row[1]}"
            }))

        elif action == "get_classes":
            cursor = conn.cursor()
            cursor.execute("""
            SELECT c.id, c.name, c.code, c.description, c.teacher_id, t.name, t.email
            FROM classes c
            LEFT JOIN users t ON c.teacher_id = t.id
            """)
            classes_list = []
            for row in cursor.fetchall():
                c_id, c_name, c_code, c_desc, t_id, t_name, t_email = row
                # Count enrollments
                cursor.execute("SELECT COUNT(id) FROM enrollments WHERE class_id = ?", (c_id,))
                enroll_count = cursor.fetchone()[0]
                classes_list.append({
                    "id": c_id,
                    "name": c_name,
                    "code": c_code,
                    "description": c_desc,
                    "teacher_name": t_name or "Unknown",
                    "teacher_email": t_email or "Unknown",
                    "student_count": enroll_count
                })
            print(json.dumps({
                "status": "success",
                "classes": classes_list
            }))

        elif action == "create_class":
            name = req.get("name")
            code = req.get("code")
            description = req.get("description")
            teacher_id = req.get("teacher_id")
            
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM classes WHERE code = ?", (code,))
            if cursor.fetchone():
                print(json.dumps({"status": "error", "message": f"Class code {code} is already taken"}))
                return
                
            cursor.execute("""
            INSERT INTO classes (name, code, description, teacher_id)
            VALUES (?, ?, ?, ?)
            """, (name, code, description, teacher_id))
            conn.commit()
            c_id = cursor.lastrowid
            
            print(json.dumps({
                "status": "success",
                "class": {
                    "id": c_id,
                    "name": name,
                    "code": code,
                    "description": description
                }
            }))

        elif action == "add_student_to_class":
            class_id = req.get("class_id")
            student_email = req.get("email")
            
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, email FROM users WHERE email = ? AND role = 'student'", (student_email,))
            student = cursor.fetchone()
            if not student:
                print(json.dumps({"status": "error", "message": f"Student with email {student_email} does not exist. They must sign up first."}))
                return
                
            s_id, s_name, s_email = student
            
            # Check enrollment
            cursor.execute("SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?", (s_id, class_id))
            if cursor.fetchone():
                print(json.dumps({"status": "error", "message": "Student is already enrolled in this class"}))
                return
                
            cursor.execute("INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)", (s_id, class_id))
            conn.commit()
            
            print(json.dumps({
                "status": "success",
                "message": f"Enrolled {s_name} successfully",
                "student": {"id": s_id, "email": s_email, "name": s_name}
            }))

        elif action == "student_join_class":
            student_id = req.get("student_id")
            class_code = req.get("code").strip().upper()
            
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, code FROM classes WHERE code = ?", (class_code,))
            classroom = cursor.fetchone()
            if not classroom:
                print(json.dumps({"status": "error", "message": f"Class code {class_code} is incorrect or class doesn't exist"}))
                return
                
            c_id, c_name, c_code = classroom
            
            # Check enrollment
            cursor.execute("SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?", (student_id, c_id))
            if cursor.fetchone():
                print(json.dumps({"status": "error", "message": "You are already enrolled in this class"}))
                return
                
            cursor.execute("INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)", (student_id, c_id))
            conn.commit()
            
            print(json.dumps({
                "status": "success",
                "message": f"Successfully joined class {c_name}",
                "class": {"id": c_id, "name": c_name, "code": c_code}
            }))

        elif action == "get_student_enrollments":
            student_id = req.get("student_id")
            cursor = conn.cursor()
            cursor.execute("""
            SELECT e.class_id, c.name, c.code, c.description, t.name, t.email
            FROM enrollments e
            JOIN classes c ON e.class_id = c.id
            LEFT JOIN users t ON c.teacher_id = t.id
            WHERE e.student_id = ?
            """, (student_id,))
            
            classes_list = []
            for row in cursor.fetchall():
                c_id, c_name, c_code, c_desc, t_name, t_email = row
                classes_list.append({
                    "id": c_id,
                    "name": c_name,
                    "code": c_code,
                    "description": c_desc,
                    "teacher_name": t_name or "Unknown",
                    "teacher_email": t_email or "Unknown",
                })
            print(json.dumps({"status": "success", "classes": classes_list}))

        elif action == "get_teacher_classes":
            teacher_id = req.get("teacher_id")
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, code, description FROM classes WHERE teacher_id = ?", (teacher_id,))
            classes_list = []
            for row in cursor.fetchall():
                c_id, c_name, c_code, c_desc = row
                cursor.execute("SELECT COUNT(id) FROM enrollments WHERE class_id = ?", (c_id,))
                enroll_count = cursor.fetchone()[0]
                classes_list.append({
                    "id": c_id,
                    "name": c_name,
                    "code": c_code,
                    "description": c_desc,
                    "student_count": enroll_count
                })
            print(json.dumps({"status": "success", "classes": classes_list}))

        elif action == "get_class_students":
            class_id = req.get("class_id")
            cursor = conn.cursor()
            cursor.execute("""
            SELECT u.id, u.name, u.email
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            WHERE e.class_id = ?
            """, (class_id,))
            students = []
            for row in cursor.fetchall():
                students.append({
                    "id": row[0],
                    "name": row[1],
                    "email": row[2]
                })
            print(json.dumps({"status": "success", "students": students}))

        elif action == "add_grade":
            student_id = req.get("student_id")
            class_id = req.get("class_id")
            title = req.get("title")
            score = float(req.get("score"))
            graded_by = req.get("graded_by")
            
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO grades (student_id, class_id, title, score, graded_by)
            VALUES (?, ?, ?, ?, ?)
            """, (student_id, class_id, title, score, graded_by))
            conn.commit()
            g_id = cursor.lastrowid
            print(json.dumps({"status": "success", "grade_id": g_id}))

        elif action == "get_class_grades":
            class_id = req.get("class_id")
            cursor = conn.cursor()
            cursor.execute("""
            SELECT g.id, g.student_id, u.name, u.email, g.title, g.score, g.graded_at
            FROM grades g
            JOIN users u ON g.student_id = u.id
            WHERE g.class_id = ?
            """, (class_id,))
            grades_list = []
            for row in cursor.fetchall():
                grades_list.append({
                    "id": row[0],
                    "student_id": row[1],
                    "student_name": row[2],
                    "student_email": row[3],
                    "title": row[4],
                    "score": row[5],
                    "graded_at": row[6]
                })
            print(json.dumps({"status": "success", "grades": grades_list}))

        elif action == "get_student_grades":
            student_id = req.get("student_id")
            cursor = conn.cursor()
            cursor.execute("""
            SELECT g.id, g.class_id, c.name, g.title, g.score, g.graded_at
            FROM grades g
            JOIN classes c ON g.class_id = c.id
            WHERE g.student_id = ?
            """, (student_id,))
            grades_list = []
            for row in cursor.fetchall():
                grades_list.append({
                    "id": row[0],
                    "class_id": row[1],
                    "class_name": row[2],
                    "title": row[3],
                    "score": row[4],
                    "graded_at": row[5]
                })
            print(json.dumps({"status": "success", "grades": grades_list}))

        elif action == "upload_document":
            title = req.get("title")
            filename = req.get("filename")
            file_data_base64 = req.get("file_data_base64")
            class_id = req.get("class_id")
            uploaded_by = req.get("uploaded_by")
            
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO documents (title, filename, file_data_base64, class_id, uploaded_by)
            VALUES (?, ?, ?, ?, ?)
            """, (title, filename, file_data_base64, class_id, uploaded_by))
            conn.commit()
            d_id = cursor.lastrowid
            print(json.dumps({"status": "success", "document_id": d_id}))

        elif action == "get_documents":
            class_id = req.get("class_id")
            cursor = conn.cursor()
            cursor.execute("""
            SELECT d.id, d.title, d.filename, u.name, d.uploaded_at
            FROM documents d
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE d.class_id = ?
            """, (class_id,))
            docs_list = []
            for row in cursor.fetchall():
                docs_list.append({
                    "id": row[0],
                    "title": row[1],
                    "filename": row[2],
                    "uploaded_by_name": row[3] or "Unknown",
                    "uploaded_at": row[4]
                })
            print(json.dumps({"status": "success", "documents": docs_list}))

        elif action == "download_document":
            doc_id = req.get("document_id")
            student_id = req.get("student_id")
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, filename, file_data_base64, class_id, uploaded_by FROM documents WHERE id = ?", (doc_id,))
            doc = cursor.fetchone()
            if not doc:
                print(json.dumps({"status": "error", "message": "Document not found"}))
                return
                
            d_id, d_title, d_filename, d_base64, d_class_id, d_uploaded_by = doc
            
            # Check enrollment
            cursor.execute("SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?", (student_id, d_class_id))
            enrolled = cursor.fetchone()
            if not enrolled:
                # Also allow the teacher of that class to view/download
                cursor.execute("SELECT id FROM classes WHERE id = ? AND teacher_id = ?", (d_class_id, student_id))
                teacher_of_class = cursor.fetchone()
                if not teacher_of_class:
                    print(json.dumps({"status": "error", "message": "Access denied: You are not enrolled in this class"}))
                    return
                    
            print(json.dumps({
                "status": "success",
                "document": {
                    "id": d_id,
                    "title": d_title,
                    "filename": d_filename,
                    "file_data_base64": d_base64
                }
            }))

        elif action == "get_admin_analytics":
            cursor = conn.cursor()
            # Fetch all grades with class names and student names
            cursor.execute("""
            SELECT g.id, g.score, g.title, c.name, u.name
            FROM grades g
            LEFT JOIN classes c ON g.class_id = c.id
            LEFT JOIN users u ON g.student_id = u.id
            """)
            grades_data = cursor.fetchall()
            if not grades_data:
                print(json.dumps({
                    "status": "success",
                    "analytics": {
                        "school_average": 0,
                        "total_grades_count": 0,
                        "class_averages": [],
                        "grade_distribution": {},
                        "report": "### School Management Performance Report\nNo grade records found in the database. Add grades in classes to see full metrics."
                    }
                }))
                return
                
            scores = [row[1] for row in grades_data]
            total_grades_count = len(scores)
            
            # School average (mean)
            school_average = sum(scores) / total_grades_count
            
            # Median
            sorted_scores = sorted(scores)
            if total_grades_count % 2 == 1:
                median_score = sorted_scores[total_grades_count // 2]
            else:
                median_score = (sorted_scores[total_grades_count // 2 - 1] + sorted_scores[total_grades_count // 2]) / 2.0
                
            # Standard Deviation
            if total_grades_count > 1:
                variance = sum((x - school_average) ** 2 for x in scores) / (total_grades_count - 1)
                std_deviation = variance ** 0.5
            else:
                std_deviation = 0.0
                
            # Group by class name for class averages
            class_grades = {}
            student_avg_calc = {}
            for row in grades_data:
                g_id, score, title, class_name, student_name = row
                class_name = class_name or "Unknown"
                student_name = student_name or "Unknown"
                
                if class_name not in class_grades:
                    class_grades[class_name] = []
                class_grades[class_name].append(score)
                
                if student_name not in student_avg_calc:
                    student_avg_calc[student_name] = []
                student_avg_calc[student_name].append(score)
                
            class_averages = []
            class_avg_low_support = []
            for c_name, c_scores in class_grades.items():
                c_avg = sum(c_scores) / len(c_scores)
                class_averages.append({
                    "class_name": c_name,
                    "score": c_avg
                })
                if c_avg < 75.0:
                    class_avg_low_support.append((c_name, c_avg))
                    
            # Sort top performers (Honor Roll)
            student_averages = []
            for s_name, s_scores in student_avg_calc.items():
                student_averages.append((s_name, sum(s_scores) / len(s_scores)))
            student_averages.sort(key=lambda x: x[1], reverse=True)
            top_performers = student_averages[:3]
            
            # Grade distribution
            grade_distribution = {
                "F (<60)": 0,
                "D (60-69)": 0,
                "C (70-79)": 0,
                "B (80-89)": 0,
                "A (90-100)": 0
            }
            for score in scores:
                if score < 60:
                    grade_distribution["F (<60)"] += 1
                elif score < 70:
                    grade_distribution["D (60-69)"] += 1
                elif score < 80:
                    grade_distribution["C (70-79)"] += 1
                elif score < 90:
                    grade_distribution["B (80-89)"] += 1
                else:
                    grade_distribution["A (90-100)"] += 1
                    
            # Generate Report MD
            report_md = f"""# Automated School Performance Report
**Generated on:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} (UTC)
**Power Source:** Pure SQL Data Processor

---

### 📊 School-wide Statistics
- **Overall Grade Average (Mean):** `{school_average:.2f}%`
- **Median Student Score:** `{median_score:.2f}%`
- **Score Consistency (Standard Deviation):** `{std_deviation:.2f}`
- **Total Grade Evaluated Units:** `{total_grades_count}`

### 🏆 Top Performing Students (Honor Roll Rank)
"""
            for idx, (s_name, s_avg) in enumerate(top_performers):
                report_md += f"{idx+1}. **{s_name}** - Average Score: `{s_avg:.2f}%`\n"
                
            report_md += "\n### 📈 Performance by Curriculum Department\n"
            for item in class_averages:
                c_name = item["class_name"]
                c_score = item["score"]
                status = "🟢 Exceptional" if c_score >= 85 else ("🟡 Meets Standards" if c_score >= 75 else "🔴 Needs Review")
                report_md += f"- **{c_name}:** `{c_score:.2f}%` ({status})\n"
                
            if class_avg_low_support:
                report_md += "\n### ⚠️ Critical Academic Support Required\nThe following curricula have recorded aggregate performance metrics below the 75% baseline. Targeted reviews are suggested:\n"
                for c_name, c_score in class_avg_low_support:
                    report_md += f"- **{c_name}** (Current Average: `{c_score:.2f}%`)\n"
            else:
                report_md += "\n### ✅ Curriculum Alignment Evaluation\nAll department portfolios currently maintain average metrics above the 75% standard baseline. No critical interventions required."
                
            print(json.dumps({
                "status": "success",
                "analytics": {
                    "school_average": round(school_average, 2),
                    "total_grades_count": total_grades_count,
                    "median_score": round(median_score, 2),
                    "std_deviation": round(std_deviation, 2),
                    "class_averages": class_averages,
                    "grade_distribution": grade_distribution,
                    "report": report_md
                }
            }))

        elif action == "get_teacher_analytics":
            teacher_id = req.get("teacher_id")
            cursor = conn.cursor()
            
            # Fetch all classes taught by teacher
            cursor.execute("SELECT id, name FROM classes WHERE teacher_id = ?", (teacher_id,))
            classes = cursor.fetchall()
            if not classes:
                print(json.dumps({"status": "success", "analytics": {"has_data": False}}))
                return
                
            class_ids = [row[0] for row in classes]
            class_id_map = {row[0]: row[1] for row in classes}
            
            # Fetch grades
            placeholders = ",".join("?" for _ in class_ids)
            cursor.execute(f"SELECT score, class_id FROM grades WHERE class_id IN ({placeholders})", class_ids)
            grades = cursor.fetchall()
            if not grades:
                print(json.dumps({"status": "success", "analytics": {"has_data": False}}))
                return
                
            scores = [row[0] for row in grades]
            total_students_graded = len(scores)
            highest_score = max(scores)
            lowest_score = min(scores)
            
            # Calculate class averages
            class_groups = {}
            for score, class_id in grades:
                c_name = class_id_map.get(class_id, "Unknown")
                if c_name not in class_groups:
                    class_groups[c_name] = []
                class_groups[c_name].append(score)
                
            class_averages = {c_name: round(sum(s_list) / len(s_list), 2) for c_name, s_list in class_groups.items()}
            
            print(json.dumps({
                "status": "success",
                "analytics": {
                    "has_data": True,
                    "class_averages": class_averages,
                    "total_students_graded": total_students_graded,
                    "highest_score": highest_score,
                    "lowest_score": lowest_score
                }
            }))

        elif action == "get_student_analytics":
            student_id = req.get("student_id")
            cursor = conn.cursor()
            
            # Fetch all grades for this student
            cursor.execute("SELECT class_id, score FROM grades WHERE student_id = ?", (student_id,))
            student_grades = cursor.fetchall()
            if not student_grades:
                print(json.dumps({"status": "success", "analytics": {"has_data": False}}))
                return
                
            scores = [row[1] for row in student_grades]
            student_avg = sum(scores) / len(scores)
            
            # Class averages for all classes the student has grades in
            class_ids = list(set(row[0] for row in student_grades))
            placeholders = ",".join("?" for _ in class_ids)
            
            cursor.execute(f"SELECT class_id, score FROM grades WHERE class_id IN ({placeholders})", class_ids)
            all_class_grades = cursor.fetchall()
            
            class_groups = {}
            for class_id, score in all_class_grades:
                if class_id not in class_groups:
                    class_groups[class_id] = []
                class_groups[class_id].append(score)
                
            class_averages = {class_id: sum(s_list) / len(s_list) for class_id, s_list in class_groups.items()}
            
            comparison = []
            for class_id, score in student_grades:
                cursor.execute("SELECT name FROM classes WHERE id = ?", (class_id,))
                c_name_row = cursor.fetchone()
                class_name = c_name_row[0] if c_name_row else "Unknown"
                
                class_avg = class_averages.get(class_id, 0.0)
                comparison.append({
                    "class_name": class_name,
                    "your_score": score,
                    "class_average": round(class_avg, 2),
                    "difference": round(score - class_avg, 2)
                })
                
            print(json.dumps({
                "status": "success",
                "analytics": {
                    "has_data": True,
                    "student_average": round(student_avg, 2),
                    "comparison": comparison
                }
            }))

        else:
            print(json.dumps({"error": f"Unknown action: {action}"}))

    except Exception as e:
        import traceback
        print(json.dumps({"error": f"Execution error: {str(e)}", "trace": traceback.format_exc()}))
    finally:
        conn.close()

if __name__ == '__main__':
    main()
