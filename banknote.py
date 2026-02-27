bill_to_pay = int(input("What's your number?: "))

fifty_thousand = bill_to_pay%50000
fifty_thousand_cash = bill_to_pay //50000

twenty_thousand = fifty_thousand%20000
twenty_thousand_cash = (fifty_thousand - twenty_thousand)// 20000

five_thousand = twenty_thousand%5000
five_thousand_cash = (twenty_thousand - five_thousand)//5000

two_thousand = five_thousand%2000
two_thousand_cash = (five_thousand - two_thousand)//2000

one_thousand = two_thousand%1000
one_thousand_cash = (two_thousand - one_thousand)//1000


print ("We need ", fifty_thousand_cash, " fifty thousand notes, " , twenty_thousand_cash, " twenty thousand notes, ", five_thousand_cash, " five thousand notes, ", two_thousand_cash, " two thousand notes, and " , one_thousand_cash, " one thousand notes to get ",bill_to_pay)