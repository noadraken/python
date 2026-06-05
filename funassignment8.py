def estimate_arrival(distance_km, weather_condition):
    estimated_travel_time = distance_km * 3
    if weather_condition == "rainy":
        estimated_travel_time += 10
    return estimated_travel_time

distance_km = float(input("Enter the distance to your destination in kilometers: "))
weather_condition = input("Enter the weather condition: ").lower()
print(f"Estimated travel time is: {estimate_arrival(distance_km, weather_condition)} minutes")