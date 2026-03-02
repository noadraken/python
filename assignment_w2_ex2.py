working_minutes = 45
working_hours = 5
convert_into_hours = working_hours + (working_minutes/60)
hourly_rate = 85000

total_payment = hourly_rate * convert_into_hours
print("The total payment is ", total_payment, " per day")
print("\n")

laptop_price = int(input("Type the Laptop price: "))
monthly_saving = int(input("Type your monthly saving: "))
months_required = laptop_price//monthly_saving
if laptop_price%monthly_saving >0:
    months_required +=1
else:
    months_required
    
print("I need to save ", months_required, " months to buy a new laptop")
    

print("\n")

travel_distance = int(input("Type how many kilometres the trip is: "))
fuel_consumption = travel_distance / 40
fuel_price  = int(fuel_consumption * 13000)
print("The total fuel price is ", fuel_price , ".")
print("\n")



base_salary = 500000
allowance = 750000
bpjs = 0.02
tax = 0.05

salary = base_salary + allowance - ((base_salary + allowance)*(bpjs+tax))
print("Salary is : ", salary)

print("\n")

length = 4
width = 3


