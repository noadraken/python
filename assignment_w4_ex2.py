salary = int(input("What's your salary?: "))
credit_score = int(input("What's your credit score?: "))
duration = int(input("What's your employment duration?: "))

if salary>=3000 and credit_score >= 650 and duration >= 2:
    print("The loan is approved")
elif (salary>=3000 and credit_score >= 650) or (credit_score >= 650 and duration >= 2) or (salary>=3000 and duration>=2):
    print("The loan receives additional approval")
else:
    print("The loan is rejected")

print("\n")

