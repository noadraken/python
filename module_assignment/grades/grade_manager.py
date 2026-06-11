import os
from students.validation import is_valid_id

FILE_PATH = os.path.join("data", "grades.txt")

def add_grade(student_id, course_id, grade):
    if not is_valid_id(student_id):
        print("Error: Invalid Student ID format.")
        return False
        
    with open(FILE_PATH, 'a') as file:
        file.write(f"{student_id},{course_id},{grade}\n")
    print("Success: Grade recorded.")
    return True

def get_all_grades():
    if not os.path.exists(FILE_PATH):
        return []
    with open(FILE_PATH, 'r') as file:
        return [line.strip().split(',') for line in file.readlines() if line.strip()]