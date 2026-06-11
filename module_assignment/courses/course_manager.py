import os

FILE_PATH = os.path.join("data", "courses.txt")

def add_course(course_id, course_name):
    if not course_id.strip() or not course_name.strip():
        print("Error: Course ID and Name cannot be empty.")
        return False
        
    with open(FILE_PATH, 'a') as file:
        file.write(f"{course_id},{course_name}\n")
    print(f"Success: Course '{course_name}' added.")
    return True

def get_all_courses():
    if not os.path.exists(FILE_PATH):
        return []
    with open(FILE_PATH, 'r') as file:
        return [line.strip().split(',') for line in file.readlines() if line.strip()]