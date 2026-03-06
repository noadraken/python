water_needed_for_a_person = 2.5
total_number_of_people = 5
total_water_consumption_per_day = water_needed_for_a_person * total_number_of_people
total_water_consumption_per_week = total_water_consumption_per_day *7
litres_per_gallon = 19
price_per_gallon = 19000

total_number_of_gallon_per_week = total_water_consumption_per_week // litres_per_gallon



if total_water_consumption_per_week%litres_per_gallon > 0:
    total_number_of_gallon_per_week+=1
else:
    total_number_of_gallon_per_week
    
total_price = total_number_of_gallon_per_week*price_per_gallon

print("Total weekly water requirements: ", total_water_consumption_per_week)
print("Total number of gallons to be purchased: ", total_number_of_gallon_per_week)
print("Total budget needed: ", total_price)

water_needed_for_a_person = 2.5
total_number_of_people = int(input("Total number of people in house: "))
total_water_consumption_per_day = water_needed_for_a_person * total_number_of_people
total_water_consumption_per_week = total_water_consumption_per_day *7
litres_per_gallon = 19
price_per_gallon = 19000

total_number_of_gallon_per_week = total_water_consumption_per_week // litres_per_gallon



if total_water_consumption_per_week%litres_per_gallon > 0:
    total_number_of_gallon_per_week+=1
else:
    total_number_of_gallon_per_week
    
total_price = total_number_of_gallon_per_week*price_per_gallon

print("Total weekly water requirements: ", total_water_consumption_per_week)
print("Total number of gallons to be purchased: ", total_number_of_gallon_per_week)
print("Total budget needed: ", total_price)
