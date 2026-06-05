def calculate_split_bill(total_bill,number_of_people,tip_percentage):
    tip_amount = total_bill * (tip_percentage / 100)
    total_with_tip = total_bill + tip_amount
    split_amount = total_with_tip / number_of_people
    return split_amount

total_bill = float(input("Enter the total bill amount: "))
number_of_people = int(input("Enter the number of people splitting the bill: "))    
tip_percentage = float(input("Enter the tip percentage you want to give: "))

amount_per_person = calculate_split_bill(total_bill, number_of_people, tip_percentage)
print(f"Each person should pay: ${amount_per_person:}")