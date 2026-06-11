import os
from students.student_manager import add_student, get_all_students
from courses.course_manager import add_course
from grades.grade_manager import add_grade
from reports.report_generator import generate_student_report

def initialize_data_folder():
    """Creates the data directory and text files if they don't exist."""
    if not os.path.exists("data"):
        os.makedirs("data")
    for filename in ["students.txt", "courses.txt", "grades.txt"]:
        filepath = os.path.join("data", filename)
        if not os.path.exists(filepath):
            open(filepath, 'w').close()

def main():
    initialize_data_folder()
    
    while True:
        print("\n=== Academic Management System ===")
        print("1. Add Student")
        print("2. Add Course")
        print("3. Record Grade")
        print("4. Generate Student Report")
        print("5. Exit")
        
        choice = input("Enter your choice (1-5): ")
        
        if choice == '1':
            student_id = input("Enter Student ID: ")
            name = input("Enter Student Name: ")
            add_student(student_id, name)
            
        elif choice == '2':
            course_id = input("Enter Course ID: ")
            course_name = input("Enter Course Name: ")
            add_course(course_id, course_name)
            
        elif choice == '3':
            student_id = input("Enter Student ID: ")
            course_id = input("Enter Course ID: ")
            grade = input("Enter Grade: ")
            add_grade(student_id, course_id, grade)
            
        elif choice == '4':
            student_id = input("Enter Student ID to generate report: ")
            generate_student_report(student_id)
            
        elif choice == '5':
            print("Exiting the system. Goodbye!")
            break
            
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()