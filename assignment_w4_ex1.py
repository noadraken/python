electricity_usage = float(input("What's your electricity usage?: "))
if electricity_usage <= 100:
    total_bill = electricity_usage * 0.1
elif electricity_usage>100 and electricity_usage <= 300:
    total_bill = electricity_usage*0.15
else:
    total_bill = electricity_usage *0.2
    
print(f"Your total bill is {total_bill}")
print("\n")

salary = int(input("What's the salary?: "))
bonus = 0
year = int(input("How many years have you been working here?: "))

if year >=10:
    bonus = 0.25
elif year >=5 and year <10:
    bonus = 0.15
elif year>=1  and year < 5:
    bonus = 0.05
else:
    bonus

total_bonus = salary*bonus
print(f"Your bonus is {total_bonus}")    

print("\n")

length1 = int(input("Type the first length of the triangle: "))
length2 = int(input("Type the second length of the triangle: "))
length3 = int(input("Type the third length of the triangle: "))

if length1 == length2 == length3:
    print("This is an equilateral triangle.")
elif length1 == length2 or length1== length3 or length2== length3:
    print("This is an isosceles triangle.")
else:
    print("This is a scalene triangle")

print("\n")

