def create_username(full_name,birth_year):
    return full_name.lower().replace(" ", "_") + birth_year[2:4]

full_name = input("Enter your full name: ")
birth_year = input("Enter your birth year: ")
print(f"Your username is: {create_username(full_name, birth_year)}")