print("No.1")
total_purchase_amount = int(input("What's your total purchase amount?: "))
discounted_amount = 0
if total_purchase_amount>= 50000:
    discounted_amount = (total_purchase_amount*0.2)  #20% discouint
    total_purchase_amount = total_purchase_amount - discounted_amount
elif total_purchase_amount >= 25000 and total_purchase_amount < 50000:
    discounted_amount = (total_purchase_amount*0.1)     #10% disocunt
    total_purchase_amount = total_purchase_amount - discounted_amount
else:
    discounted_amount
    total_purchase_amount
    

print("Discounted amount is ", discounted_amount, " and you have to pay ", total_purchase_amount)
print("\n")

print("No.2")
temperature = float(input("What's the temperature in Celsius now?: "))
farenheit = (temperature * 9/5) +32
kelvin = temperature + 273.15
print("Temperature in Farenheint: ", farenheit)
print("Temperature in Kelvin : ", kelvin)
print("\n")

print("No.3")
distance = float(input("What's your Distance in km?: "))
metres = distance *1000
centimetre = metres * 100
miles = distance * 0.621371
print("Distance in metres: ", metres)
print("Distance in centimetres: ", centimetre)
print("Distance in miles: ", miles)
print("\n")

print("No.4")
first_number = int(input("What's the first number?:"))
second_number = int(input("What's the second number?: "))
third_number = int(input("What's the third number?: "))
if first_number>=second_number and first_number >=third_number:
    print(first_number, " is the largest")
elif second_number>=first_number and second_number>= third_number:
    print(second_number, " is the largest")
else:
    print(third_number, " is the largest")
print("\n")

print("No.5")
length = int(input("Length: "))
width = int(input("Width: "))
area = length * width
perimeter = 2*(length+width)
print("Area is " , area)
print("Perimeter is ", perimeter)
if area > 100:
    print("Large Area")
print("\n")
