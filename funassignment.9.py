def validate_tweet(input_text):
    if len(input_text) <= 140:
        return input_text
    else:
        return input_text[:140] + "..."

input_text = input("Enter your tweet: ")
print(validate_tweet(input_text))