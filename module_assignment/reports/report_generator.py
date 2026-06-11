from students.student_manager import get_all_students
from grades.grade_manager import get_all_grades

def generate_student_report(student_id):
    students = get_all_students()
    grades = get_all_grades()

    # Find student name
    student_name = "Unknown"
    for s_id, name in students:
        if s_id == student_id:
            student_name = name
            break

    print(f"\n--- Academic Report for {student_name} (ID: {student_id}) ---")
    
    # Filter grades for this student
    student_grades = [g for g in grades if g[0] == student_id]
    
    if not student_grades:
        print("No grades recorded for this student.")
    else:
        for record in student_grades:
            # record is [student_id, course_id, grade]
            print(f"Course ID: {record[1]} | Grade: {record[2]}")
            
    print("-" * 50)