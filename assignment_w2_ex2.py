working_minutes = 45
working_hours = 5
convert_into_hours = working_hours + (working_minutes/60)
hourly_rate = 85000

total_payment = hourly_rate * convert_into_hours
print("The total payment is ", total_payment, " per day")

income_per_month = total_payment * 30


laptop_price = 1400000

months_required = laptop_price / income_per_month

if laptop_price%income_per_month>0:
    months_required =+1
else:
    months_required
    
print("If he collect his daily income, his monthly income will be ", income_per_month, ". He needs to collect ", months_required, "months worth of income to be able to afford a new laptop.")

print("\n\n")






base_salary = 500000
allowance = 750000
bpjs = 0.02
tax = 0.05

salary = base_salary + allowance - ((base_salary + allowance)*(bpjs+tax))
print("Salary is : ", salary)

print("\n\n")


