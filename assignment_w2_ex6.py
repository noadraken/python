length = 4
width = 3
# I didn't included the height
# because if we include height it will become
# volume instead of area and we cannot paint the volume
# We can only paint the surface area so I only calculate for area

area = length * width
total_paint_cans = int(area / 10)

if int(area% 10)>0:
    total_paint_cans += 1
else:
    total_paint_cans

print("Total number of paint cans needed: ", total_paint_cans)

length = int(input("What's the length?: "))
width = int(input("What's the width?: "))
# I didn't included the height
# because if we include height it will become
# volume instead of area and we cannot paint the volume
# We can only paint the surface area so I only calculate for area

area = length * width
total_paint_cans = int(area / 10)

if int(area% 10)>0:
    total_paint_cans += 1
else:
    total_paint_cans

print("Total number of paint cans needed: ", total_paint_cans)