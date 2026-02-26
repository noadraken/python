print("No.1")
number = int(input("Type the number: "))
if number>0:
    print("Positive")
elif number<0:
    print("Negative")
else:
    print(0)
    
print()
print()

print("No.2")
value_1, value_2, value_3 = int(input("Value 1: ")), int(input("Value 2: ")), int(input("Value 3: "))
total = value_1 + value_2 + value_3
average = total/3
print(average)

print()
print()

print("No.3")
age = int(input("What's your age?: "))
if age> 17:
    print("Adult")
else:
    print("Minor")
    
print()
print()

print("No.4")
price = float(input("What's your total for purchase?"))
if price >10000:
    print(price - (price*0.1))
else:
    print(price)
    
print()
print()

print("No.5")
num_1 = int(input("Input number 1: "))
num_2 = int(input("Input number 2: "))
if num_1>num_2:
    print(num_1)
elif num_2>num_1:
    print(num_2)
else:
    print("Both numbers are equal")