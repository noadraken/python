initial_laptop_price = 12000000
salvage_value = 2000000
economic_life = 4

annual_depreciation = (initial_laptop_price - salvage_value)/economic_life
laptop_value_after_two_years = initial_laptop_price - (annual_depreciation*2)

print("Annual depreciation: ", annual_depreciation)
print("Laptop value after two years: ", laptop_value_after_two_years)