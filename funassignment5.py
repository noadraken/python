def check_discount(total_price, ticket_quantity, coupon_code):
    if coupon_code == "NONTONSERU" and ticket_quantity >= 2:
        discount = 15000
        total_price -= discount
    return total_price 

total_price = float(input("Enter the total price of the tickets: "))
ticket_quantity = int(input("Enter the quantity of tickets: "))
coupon_code = input("Enter the coupon code (if any): ")
final_price = check_discount(total_price, ticket_quantity, coupon_code)
print(f"The final price after applying the discount (if applicable) is: {final_price}")
        