name = "I love Sukabumi and Bandung"

splitword = name.split()

someword = splitword[2:]
print(someword)

joinword = ",".join(someword).replace(",and", "")
print(joinword)
