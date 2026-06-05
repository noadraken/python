import shape.square as sq

width = float(input("Enter the width of the square: "))
side = float(input("Enter the side of the square: "))
area = sq.area(width, side)
print(f"The area of the square is: {area}")