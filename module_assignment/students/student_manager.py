import os
from students.validation import is_valid_id, is_valid_name

FILE_PATH = os.path.join("data", "students.txt")

def add_student(student_id, name):
    if not is_valid_id(student_id) or not is_valid_name(name):
        print("Error: Invalid ID or Name format.")
        return False
        
    with open(FILE_PATH, 'a') as file:
        file.write(f"{student_id},{name}\n")
    print(f"Success: Student '{name}' added.")
    return True

def get_all_students():
    if not os.path.exists(FILE_PATH):
        return []
    with open(FILE_PATH, 'r') as file:
        # Returns a list of lists: [['ID1', 'Name1'], ['ID2', 'Name2']]
        return [line.strip().split(',') for line in file.readlines() if line.strip()]