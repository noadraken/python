text = "mang kasir aplikasi sederhana"
words = text.split()
word_count = 0
for word in words:
    word_count += 1
print(f"words = {word_count}")
        
text_without_spaces = text.replace(" ", "")        
character_count = 0
for character in text_without_spaces:
    character_count += 1
print(f"characters = {character_count}")



for row in range(4):
    for col in range(5):
        if col == 2:
            print("0", end=" ")
        else:
            print("*", end=" ")
    print()
    
print("\n")

for row1 in range(4):
    for col1 in range(5):
        if (row1 == 0 or row1 == 3) and col1 == 2:
            print("0", end=" ")
        elif (row1 == 1 or row1 == 2) and (col1 == 1 or col1 == 2 or col1 == 3):
            print("0", end=" ")
        else:
            print("*", end=" ")
    print()