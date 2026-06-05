def is_passed(student_score, passing_score=40):
    if student_score >= passing_score:
        return True
    else:
        return False
    
student_score = int(input("Enter the student's score: "))
print("Passed" if is_passed(student_score) 
      else "Failed")