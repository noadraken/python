laptop_price = int(input("Type the Laptop price: "))
monthly_saving = int(input("Type your monthly saving: "))
months_required = laptop_price//monthly_saving
if laptop_price%monthly_saving >0:
    months_required +=1
else:
    months_required
    
print("I need to save ", months_required, " months to buy a new laptop")