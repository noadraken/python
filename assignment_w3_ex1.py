username = input("What's your username: ")
if len(username)<5:
    print("Username too short")
else:
    print("Username accepted")

print("\n")

full_name = input("What's your full name?: ")
name_split = full_name.split()
first_name = name_split[:1]
print("First name is ", first_name)
print("\n")

word = input("What's the word?: ")
capitalizer = word.capitalize()
print("Capitalized word: ", capitalizer)
print("\n")

word2 = input("Enter a word: ")
first_letter = word2[0]
print(first_letter)
if first_letter =='A' or first_letter == 'a':
    print("Starts with A")
else:
    print("Doesn't start with A")

print("\n")

sentence = input("Write a sentence: ")
replace = sentence.replace(" ", "_")
print(replace)