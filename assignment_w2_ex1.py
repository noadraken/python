total_bill = 347500
total_bill_with_tax = total_bill + (total_bill*0.1)

total_people = 3
each_person_pay = total_bill_with_tax/total_people


money100000 = int(each_person_pay//100000)
money_left = each_person_pay%100000

money50000 = int(money_left//50000)
money_left = money_left %50000

money20000 = int(money_left//20000)
money_left = money_left%20000

money10000 = int(money_left//10000)
money_left = money_left%10000

money5000 = int(money_left//5000)
money_left = money_left%5000

money2000 = int(money_left//2000)
money_left = money_left%2000

money1000 = int(money_left//1000)
money_left = money_left%1000

print("Toal after tax is : ", total_bill_with_tax)
print("They have to pay ", money100000, " hundred thousand notes, ",
      money50000 , " fifty thousand notes, ",
      money20000, " twenty thousand notes, ",
      money10000, " ten thousand notes, ",
      money5000, " five thousand notes, ",
      money2000, " two thousand notes, and ",
      money1000, " one thousand notes for ", 
      each_person_pay, " for each person and one person has to pay the remaining ", money_left)