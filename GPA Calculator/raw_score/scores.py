import os
import pandas as pd
from students import students_data
from subjects import subjects

FILE_PATH = os.path.join("data", "scores.csv")
df = pd.read_csv(FILE_PATH)

