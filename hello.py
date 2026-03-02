import pandas as pd  

data = {"Name": ["Spongebob", "Patrick", "Squidward"],
        "Age": [30,35,40]}

df = pd.DataFrame(data, index = ["Employee 1", "Employee 2", "Employee 3"])
print(df.loc["Patrick"])