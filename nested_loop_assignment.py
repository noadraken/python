# First pattern: Cross
for i in range(5):
    for j in range(5):
        if i == 2 or j == 2:
            print("*", end=" ")
        else:
            print("-", end=" ")
    print()

print("\n")


for row in range(5):
    for col in range(5):
        if row == 0 or row == 4 or col == 0 or col == 4:
            print("*", end=" ")
        else:
            print("-", end=" ")
    print()