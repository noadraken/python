def format_address(street, city, province, postal_code):
    return f"{street}, {city}, {province} {postal_code}"

street = input("Enter the street address: ")
city = input("Enter the city: ")
province = input("Enter the province: ")
postal_code = input("Enter the postal code: ")

final_address = format_address(street, city, province, postal_code)
print(f"Your address is {final_address}")