export interface Subject {
  Code: string;
  SubjectName: string;
  SKS: number;
}

export interface Student {
  StudentID: string;
  StudentName: string;
  Group: string;
}

export interface RawScore {
  ID: number;
  SubjectCode: string;
  StudentID: string;
  Score: number;
}

export interface GradeMapping {
  letter: string;
  points: number;
}

export interface MergedRecord {
  ID: number;
  StudentID: string;
  StudentName: string;
  Group: string;
  SubjectCode: string;
  SubjectName: string;
  SKS: number;
  Score: number;
  Grade: string;
  GradePoints: number;
}

export interface GPAReportItem {
  StudentID: string;
  StudentName: string;
  Group: string;
  TotalSKS: number;
  GPA: number;
  SubjectsTaken: number;
  PassedCredits: number; // credits where grade point > 0
}
