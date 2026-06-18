import os
import pandas as pd

file_path = os.path.join("data", "students.csv")
df = pd.read_csv(file_path)

student_id = input("Enter Student ID: ")
student_name = input("Enter Student Name: ")

df = pd.DataFrame({'student_id': [student_id], 'student_name': [student_name]})
df.to_csv(file_path, mode='a', header=not os.path.exists(file_path), index=False)

students_df = pd.read_csv(file_path)
print(students_df)