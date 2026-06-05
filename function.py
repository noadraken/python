def money_calculator(amount, tax_rate):
    tax_price = tax_rate / 100
    tax_amount = amount * tax_price
    total_amount = amount + tax_amount
    return total_amount

total_money = float(input("Total money you have: "))
total_amount = money_calculator(5000, 7)
money_left = total_money - total_amount if total_money > total_amount else 0
print(f"You have {money_left} left after buying the item." if money_left > 0 else "You don't have enough money to buy the item.")