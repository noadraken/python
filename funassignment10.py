def calculateloyaltypoint (total_transaction, member_status):
    if member_status == False:
        return 0
    else:
        return total_transaction//20000

total_transaction = float(input("Enter the total transaction amount: "))
member_status_input = input("Are you a member?(yes/no): ").lower()
if member_status_input == "yes":
    member_status = True
else:
    member_status = False

loyalty_points = calculateloyaltypoint(total_transaction, member_status)
print(f"You have earned {loyalty_points} loyalty points.")