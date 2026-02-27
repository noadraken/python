base_salary = 500000
allowance = 750000
bpjs = 0.02
tax = 0.05

salary = base_salary + allowance - ((base_salary + allowance)*(bpjs+tax))
print("Salary is : ", salary)

print("\n\n")


