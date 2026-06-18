import os
import pandas as pd

file_path = os.path.join("data", "subjects.csv")
df = pd.read_csv(file_path)

subjects_id = input("Enter Subject ID: ")
subject_name = input("Enter Subject Name: ")
sks = input("Enter SKS: ")
new_subject = pd.DataFrame({'subject_id': [subjects_id], 'subject_name': [subject_name], 'sks': [sks]})
new_subject.to_csv(file_path, mode='a', header=not os.path.exists(file_path), index=False)

subjects_df = pd.read_csv(file_path)
print(subjects_df)