import { Subject, Student, RawScore, MergedRecord, GPAReportItem } from './types';

export const initialSubjects: Subject[] = [
  { Code: 'IF101', SubjectName: 'Programming Fundamentals', SKS: 3 },
  { Code: 'IF102', SubjectName: 'Database Systems', SKS: 3 },
  { Code: 'IF103', SubjectName: 'Web Programming', SKS: 2 }
];

export const initialStudents: Student[] = [
  { StudentID: 'S001', StudentName: 'Ahmad', Group: 'A' },
  { StudentID: 'S002', StudentName: 'Budi', Group: 'A' },
  { StudentID: 'S003', StudentName: 'Cindy', Group: 'B' }
];

export const initialRawScores: RawScore[] = [
  { ID: 1, SubjectCode: 'IF101', StudentID: 'S001', Score: 85 },
  { ID: 2, SubjectCode: 'IF102', StudentID: 'S001', Score: 78 },
  { ID: 3, SubjectCode: 'IF101', StudentID: 'S002', Score: 90 },
  { ID: 4, SubjectCode: 'IF103', StudentID: 'S003', Score: 88 }
];

/**
 * Maps a numeric score (0-100) to a Letter Grade and Grade Points.
 * Typical Indonesian/Standard academic scaling.
 */
export function getGradeAndPoints(score: number): { letter: string; points: number } {
  if (score >= 85) {
    return { letter: 'A', points: 4.0 };
  } else if (score >= 75) {
    return { letter: 'B', points: 3.0 };
  } else if (score >= 65) {
    return { letter: 'C', points: 2.0 };
  } else if (score >= 50) {
    return { letter: 'D', points: 1.0 };
  } else {
    return { letter: 'E', points: 0.0 };
  }
}

/**
 * Join data from different lists in a way that mimics pd.DataFrame.merge()
 * converts numeric scores, computes GPA (IPK) using weighted SKS averages.
 */
export function processAcademicData(
  subjects: Subject[],
  students: Student[],
  rawScores: RawScore[]
) {
  // 1. Create maps for instantaneous lookup (mimicking indexes/merge)
  const subjectMap = new Map<string, Subject>();
  subjects.forEach(s => subjectMap.set(s.Code, s));

  const studentMap = new Map<string, Student>();
  students.forEach(s => studentMap.set(s.StudentID, s));

  // 2. Perform the Join (RawScores merged with Students and Subjects)
  const mergedRecords: MergedRecord[] = [];

  rawScores.forEach(scoreItem => {
    const student = studentMap.get(scoreItem.StudentID);
    const subject = subjectMap.get(scoreItem.SubjectCode);

    if (student && subject) {
      const gradeInfo = getGradeAndPoints(scoreItem.Score);
      mergedRecords.push({
        ID: scoreItem.ID,
        StudentID: scoreItem.StudentID,
        StudentName: student.StudentName,
        Group: student.Group,
        SubjectCode: scoreItem.SubjectCode,
        SubjectName: subject.SubjectName,
        SKS: subject.SKS,
        Score: scoreItem.Score,
        Grade: gradeInfo.letter,
        GradePoints: gradeInfo.points
      });
    }
  });

  // 3. Group by Student to calculate GPA (IPK)
  // GPA = Sum(GradePoints * SKS) / Sum(SKS)
  const studentGPAs: GPAReportItem[] = [];

  students.forEach(student => {
    const studentScores = mergedRecords.filter(r => r.StudentID === student.StudentID);

    if (studentScores.length > 0) {
      let totalWeightedPoints = 0;
      let totalSKS = 0;
      let passedCredits = 0;

      studentScores.forEach(record => {
        totalWeightedPoints += record.GradePoints * record.SKS;
        totalSKS += record.SKS;
        if (record.GradePoints > 0) {
          passedCredits += record.SKS;
        }
      });

      const gpa = totalSKS > 0 ? totalWeightedPoints / totalSKS : 0;

      studentGPAs.push({
        StudentID: student.StudentID,
        StudentName: student.StudentName,
        Group: student.Group,
        TotalSKS: totalSKS,
        GPA: Number(gpa.toFixed(2)),
        SubjectsTaken: studentScores.length,
        PassedCredits: passedCredits
      });
    } else {
      // Student has no scores registered yet
      studentGPAs.push({
        StudentID: student.StudentID,
        StudentName: student.StudentName,
        Group: student.Group,
        TotalSKS: 0,
        GPA: 0.0,
        SubjectsTaken: 0,
        PassedCredits: 0
      });
    }
  });

  // 4. Calculate Average GPA of Class (Only counting students who actually have GPA items)
  const studentsWithGrades = studentGPAs.filter(item => item.SubjectsTaken > 0);
  const averageGPA =
    studentsWithGrades.length > 0
      ? studentsWithGrades.reduce((sum, s) => sum + s.GPA, 0) / studentsWithGrades.length
      : 0;

  return {
    mergedRecords,
    gpaReport: studentGPAs,
    averageGPA: Number(averageGPA.toFixed(2))
  };
}
