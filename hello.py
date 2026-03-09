import pandas as pd  

df = pd.read_csv("pokemon.csv")

group = df.groupby("Type1")

print(group["Name"].count())
