def convert_minutes(number_of_episodes, duration_per_episode):
    total_viewing_time = number_of_episodes * duration_per_episode
    hours = total_viewing_time // 60
    minutes = total_viewing_time % 60
    return (hours, minutes)

number_of_episodes = int(input("Enter the number of episodes: "))
duration_per_episode = int(input("Enter the duration of each episode in minutes: "))
total_minutes = convert_minutes(number_of_episodes, duration_per_episode)
print(f"Total viewing time is {total_minutes[0]} hours and {total_minutes[1]} minutes.")