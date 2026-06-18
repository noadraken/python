export interface CodeStep {
  id: string;
  title: string;
  description: string;
  pandasCommand: string;
  codeSnippet: string;
  explanation: string;
  objective: string;
}

export const pythonCodeSteps: CodeStep[] = [
  {
    id: "read",
    title: "1. Read Data Sheets",
    description: "Load the spreadsheet files using Pandas `pd.read_excel()` to convert each sheet into a dynamic DataFrame.",
    pandasCommand: "pd.read_excel(file, sheet_name=...)",
    codeSnippet: `import pandas as pd

# Load the file path
file_path = "academic_data.xlsx"

# Read each sheet into distinct DataFrames
df_subjects = pd.read_excel(file_path, sheet_name="Subjects")
df_students = pd.read_excel(file_path, sheet_name="Students")
df_scores = pd.read_excel(file_path, sheet_name="RawScores")`,
    explanation: "Pandas reads standard Excel sheets beautifully. By specifying `sheet_name`, we target individual tab data streams, parsing tabular cells directly into in-memory, high-performance DataFrames with column labels.",
    objective: "Reading Excel sheets with Pandas into corresponding structured DataFrames."
  },
  {
    id: "display",
    title: "2. Display Master Lists",
    description: "Display raw student details and subject profiles to verify current datasets are loaded successfully.",
    pandasCommand: "print(df.to_string())",
    codeSnippet: `print("=== Subjects Master List ===")
print(df_subjects)

print("\\n=== Students Master List ===")
print(df_students)`,
    explanation: "Displaying the loaded data confirms table headers (columns) and row content are recognized cleanly. In notebook environments, the DataFrame renders as a clean HTML grid table.",
    objective: "Working with multiple DataFrames and inspecting structural columns."
  },
  {
    id: "merge",
    title: "3. Merge / Join DataFrames",
    description: "Combine related sheets (RawScores, Students, and Subjects) together using relational foreign keys like StudentID and SubjectCode.",
    pandasCommand: "pd.merge(df1, df2, on=..., how='inner')",
    codeSnippet: `# Merge scores list with students profile details (Matching StudentID)
df_merged = pd.merge(df_scores, df_students, on="StudentID", how="inner")

# Merge previously joined list with Subjects list (Matching SubjectCode and Code)
df_merged = pd.merge(
    df_merged, 
    df_subjects, 
    left_on="SubjectCode", 
    right_on="Code", 
    how="inner"
)`,
    explanation: "This acts like a SQL JOIN. We match 'StudentID' inside the RawScores and Students sheets, and then match 'SubjectCode' from the scores with the unique primary 'Code' column of the Subjects Master Sheet.",
    objective: "Performing full data merging (merge()) using standard keys."
  },
  {
    id: "grade",
    title: "4. Grade Conversion Custom Function",
    description: "Translate student numerical scores (0-100) into standardized letter grades (A, B, C, etc.) and corresponding Grade Points (4.0, 3.0, etc.) using custom row conversions.",
    pandasCommand: "df['Score'].apply(custom_function)",
    codeSnippet: `def get_grade_info(score):
    if score >= 85:
        return 'A', 4.0
    elif score >= 75:
        return 'B', 3.0
    elif score >= 65:
        return 'C', 2.0
    elif score >= 50:
        return 'D', 1.0
    else:
        return 'E', 0.0

# Apply functions to transform Score data into Letter Grades and Grade Points
grade_tuples = df_merged['Score'].apply(get_grade_info)
df_merged['Grade'] = [g[0] for g in grade_tuples]
df_merged['GradePoints'] = [g[1] for g in grade_tuples]`,
    explanation: "Using Pandas' `.apply()` allows running custom cell-level transformations. By evaluating scores, we produce grade points which are required for computing the weighted GPA.",
    objective: "Applying cell mapping functions to transform metrics."
  },
  {
    id: "gpa",
    title: "5. Student GPA (IPK) Calculation",
    description: "Aggregate the scores of each individual student. GPA is a weighted average based on the course credit loads (SKS).",
    pandasCommand: "df.groupby(['StudentID']).agg(...) & Weighted Mean",
    codeSnippet: `# Calculate SKS weight: SKS * GradePoints for each record
df_merged['WeightedPoints'] = df_merged['GradePoints'] * df_merged['SKS']

# Group by Student ID & Name to aggregate total credits and weighted values
gpa_grouped = df_merged.groupby(['StudentID', 'StudentName', 'Group']).agg(
    TotalSKS=('SKS', 'sum'),
    TotalWeightedPoints=('WeightedPoints', 'sum'),
    SubjectsTaken=('SubjectCode', 'count')
).reset_index()

# Calculate dynamic GPA (IPK): sum of weighted credit points divided by total SKS
gpa_grouped['GPA'] = (gpa_grouped['TotalWeightedPoints'] / gpa_grouped['TotalSKS']).round(2)

# Merge back with the master student list so students without grades are preserved with 0.0
gpa_report = pd.merge(
    df_students[['StudentID', 'StudentName', 'Group']], 
    gpa_grouped[['StudentID', 'TotalSKS', 'GPA', 'SubjectsTaken']], 
    on='StudentID', 
    how='left'
)
gpa_report['GPA'] = gpa_report['GPA'].fillna(0.0)
gpa_report['TotalSKS'] = gpa_report['TotalSKS'].fillna(0).astype(int)
gpa_report['SubjectsTaken'] = gpa_report['SubjectsTaken'].fillna(0).astype(int)`,
    explanation: "GPA stands for Indeks Prestasi Kumulatif (IPK). It requires a weighted average because courses carry different SKS counts (credits). Simple score averages would be mathematically incorrect.",
    objective: "Calculating weighted averages using mathematical SKS weights."
  },
  {
    id: "class_average",
    title: "6. Class Average GPA",
    description: "Compute the general performance of the entire cohort by taking the mean GPA of students with active grades.",
    pandasCommand: "gpa_report['GPA'].mean()",
    codeSnippet: `# Find mean GPA of all active students who took at least one course
active_students = gpa_report[gpa_report['SubjectsTaken'] > 0]
class_average_gpa = active_students['GPA'].mean()

print(f"Cohort Academic Performance Average IPK: {class_average_gpa:.2f}")`,
    explanation: "Evaluating statistics like standard mean on Series data helps teachers analyze group outcomes. Filter clauses like `[gpa_report['SubjectsTaken'] > 0]` ensure non-participants don't skew the classroom average.",
    objective: "Formulating aggregated metrics of tabular structures."
  },
  {
    id: "save",
    title: "7. Save Report Sheets",
    description: "Export the master sheets and the newly generated GPA_Report DataFrame as a multi-sheet integrated workbook.",
    pandasCommand: "pd.ExcelWriter(..., engine='xlsxwriter')",
    codeSnippet: `# Use pd.ExcelWriter to export multiple sheets to a single workbook
output_path = "academic_data_processed.xlsx"

with pd.ExcelWriter(output_path, engine="xlsxwriter") as writer:
    df_subjects.to_excel(writer, sheet_name="Subjects", index=False)
    df_students.to_excel(writer, sheet_name="Students", index=False)
    df_scores.to_excel(writer, sheet_name="RawScores", index=False)
    gpa_report.to_excel(writer, sheet_name="GPA_Report", index=False)

print("Workbook saved successfully with GPA_Report sheet!")`,
    explanation: "Pandas integrates ExcelWriter to bundle discrete DataFrames into tabbed sheets in a single file. Essential for professional records preservation.",
    objective: "Writing and exporting complex structured sheets using ExcelWriter."
  }
];

export const FullPythonScript = `import pandas as pd
import numpy as np

# Let's define the path of the input Excel workbook
file_path = "academic_data.xlsx"

try:
    # 1. Read data from all sheets
    df_subjects = pd.read_excel(file_path, sheet_name="Subjects")
    df_students = pd.read_excel(file_path, sheet_name="Students")
    df_scores = pd.read_excel(file_path, sheet_name="RawScores")
    
    print("✓ Successfully imported spreadsheet data!")
    print(f"Subjects: {len(df_subjects)} records, Students: {len(df_students)} records, RawScores: {len(df_scores)} records")
    
    # 2. Display Student and Subject Information
    print("\\n--- Subjects Master List ---")
    print(df_subjects.to_string(index=False))
    
    print("\\n--- Students Master List ---")
    print(df_students.to_string(index=False))
    
    # 3. Join data from different sheets using StudentID and SubjectCode
    # First, join RawScores with Students
    df_merged = pd.merge(df_scores, df_students, on="StudentID", how="inner")
    
    # Next, join with Subjects (Note: code in Subjects, SubjectCode in scores)
    df_merged = pd.merge(df_merged, df_subjects, left_on="SubjectCode", right_on="Code", how="inner")
    
    # 4. Convert numeric scores into letter grades and calculate Grade Points
    def convert_score_to_grade(score):
        if score >= 85:
            return 'A', 4.0
        elif score >= 75:
            return 'B', 3.0
        elif score >= 65:
            return 'C', 2.0
        elif score >= 50:
            return 'D', 1.0
        else:
            return 'E', 0.0
            
    # Apply grading logic
    grade_data = df_merged['Score'].apply(convert_score_to_grade)
    df_merged['Grade'] = [g[0] for g in grade_data]
    df_merged['GradePoints'] = [g[1] for g in grade_data]
    
    # 5. Calculate GPA (IPK) for each student based on subject credits (SKS)
    # Step A: Weighted product (GradePoints * SKS)
    df_merged['WeightedPoints'] = df_merged['GradePoints'] * df_merged['SKS']
    
    # Step B: Aggregate total weights & values grouped by student
    gpa_grouped = df_merged.groupby(['StudentID', 'StudentName', 'Group']).agg(
        TotalSKS=('SKS', 'sum'),
        TotalWeightedPoints=('WeightedPoints', 'sum'),
        SubjectsTaken=('SubjectCode', 'count')
    ).reset_index()
    
    # Step C: Weighted Division
    gpa_grouped['GPA'] = (gpa_grouped['TotalWeightedPoints'] / gpa_grouped['TotalSKS']).round(2)
    
    # Merge back to include students with no registered grades (0 GPA / 0 total credits)
    gpa_report = pd.merge(
        df_students[['StudentID', 'StudentName', 'Group']], 
        gpa_grouped[['StudentID', 'TotalSKS', 'GPA', 'SubjectsTaken']], 
        on='StudentID', 
        how='left'
    )
    # Fill NaN values with safe defaults
    gpa_report['GPA'] = gpa_report['GPA'].fillna(0.0)
    gpa_report['TotalSKS'] = gpa_report['TotalSKS'].fillna(0).astype(int)
    gpa_report['SubjectsTaken'] = gpa_report['SubjectsTaken'].fillna(0).astype(int)
    
    # 6. Display GPA of every student
    print("\\n--- GPA (IPK) REPORT ---")
    print(gpa_report[['StudentID', 'StudentName', 'Group', 'TotalSKS', 'GPA', 'SubjectsTaken']].to_string(index=False))
    
    # 7. Calculate and display class average GPA
    # Only active students with recorded grades are factored into the averages
    active_students = gpa_report[gpa_report['SubjectsTaken'] > 0]
    class_average = active_students['GPA'].mean()
    print(f"\\nClass Performance Indicators:")
    print(f" - Active Students Classified: {len(active_students)}")
    print(f" - Average Cohort GPA (IPK): {class_average:.2f}")
    
    # 8. Save the final GPA report as 'GPA_Report' sheet in the workbook
    output_file = "academic_data_processed.xlsx"
    with pd.ExcelWriter(output_file, engine="xlsxwriter") as writer:
        df_subjects.to_excel(writer, sheet_name="Subjects", index=False)
        df_students.to_excel(writer, sheet_name="Students", index=False)
        df_scores.to_excel(writer, sheet_name="RawScores", index=False)
        gpa_report.to_excel(writer, sheet_name="GPA_Report", index=False)
        
    print(f"\\n✓ GPA Report saved to '{output_file}'!")

except FileNotFoundError:
    print(f"Error: Could not locate '{file_path}'. Please ensure the input Excel exists.")
except Exception as e:
    print(f"Academic processing failure: {e}")
`;
