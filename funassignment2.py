def calculate_overtime_salary(base_salary, total_hours_worked):
    if total_hours_worked > 40:
        overtime_hours = total_hours_worked - 40
        overtime_pay = overtime_hours * 50000
        return base_salary + overtime_pay
    else:
        return base_salary
    
base_salary = float(input("Enter your salary: "))
total_hours_worked = int(input("Enter total hours worked: "))

total_salary = calculate_overtime_salary(base_salary, total_hours_worked)
print(f"Total Salary is {total_salary}")