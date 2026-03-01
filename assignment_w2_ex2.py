working_minutes = 45
working_hours = 5
convert_into_hours = working_hours + (working_minutes/60)
hourly_rate = 85000

total_payment = hourly_rate * convert_into_hours
print("The total payment is ", total_payment)

print("\n\n")



base_salary = 500000
allowance = 750000
bpjs = 0.02
tax = 0.05

salary = base_salary + allowance - ((base_salary + allowance)*(bpjs+tax))
print("Salary is : ", salary)

print("\n\n")


