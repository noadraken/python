print("No.1")
input_string = input("Enter numbers separated by spaces: ")
numbers = []
for num in input_string.split():
    numbers.append(int(num))

count = 0
for num in numbers:
    if num % 2 == 0:
        count += 1

print("The number of even is", count)
print("\nNo.2")

a = int(input("Enter first number: "))
b = int(input("Enter second number: "))
c = int(input("Enter third number: "))

largest = a
if b > largest:
    largest = b
if c > largest:
    largest = c

print("The largest number is", largest)
print("\nNo.3")

numbers2 = input("Enter numbers separated by spaces: ")
total = 0
for num in numbers2.split():
    total += int(num)

print("The sum of the list is =", total)

print("\nNo.5")

numbers3 = input("Enter numbers separated by spaces: ")
numbers4 = []
for num in numbers3.split():
    numbers4.append(int(num))

largest = numbers4[0]
second_largest = None

for num in numbers4:
    if num > largest:
        second_largest = largest
        largest = num
    elif num != largest and (second_largest is None or num > second_largest):
        second_largest = num

print("The second largest number is", second_largest)
