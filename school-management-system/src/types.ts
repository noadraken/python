export interface User {
  id: number;
  email: string;
  role: "admin" | "teacher" | "student";
  name: string;
}

export interface Class {
  id: number;
  name: string;
  code: string;
  description: string;
  teacher_name?: string;
  teacher_email?: string;
  student_count?: number;
}

export interface Grade {
  id: number;
  class_id?: number;
  class_name?: string;
  student_id?: number;
  student_name?: string;
  student_email?: string;
  title: string;
  score: number;
  graded_at: string;
}

export interface Document {
  id: number;
  title: string;
  filename: string;
  uploaded_by_name?: string;
  uploaded_at: string;
}

export interface ClassAverage {
  class_name: string;
  score: number;
}

export interface AdminAnalytics {
  school_average: number;
  total_grades_count: number;
  median_score: number;
  std_deviation: number;
  class_averages: ClassAverage[];
  grade_distribution: { [key: string]: number };
  report: string;
}

export interface TeacherAnalytics {
  has_data: boolean;
  class_averages?: { [key: string]: number };
  total_students_graded?: number;
  highest_score?: number;
  lowest_score?: number;
}

export interface StudentAnalytics {
  has_data: boolean;
  student_average?: number;
  comparison?: Array<{
    class_name: string;
    your_score: number;
    class_average: number;
    difference: number;
  }>;
}
