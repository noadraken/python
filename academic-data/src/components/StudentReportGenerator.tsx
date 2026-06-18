import { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { Search, Download, Award, BookOpen, AlertCircle, CheckCircle, RefreshCw, FileText, UserCheck } from 'lucide-react';
import { Student, MergedRecord, GPAReportItem } from '../types';

interface StudentReportGeneratorProps {
  students: Student[];
  mergedRecords: MergedRecord[];
  gpaReport: GPAReportItem[];
}

export default function StudentReportGenerator({
  students,
  mergedRecords,
  gpaReport
}: StudentReportGeneratorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter students based on ID or Name
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return students.filter(
      st =>
        st.StudentID.toLowerCase().includes(query) ||
        st.StudentName.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  // Handle selection of a student
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery(''); // clear query on selection
    setFeedback(null);
  };

  // Find academic details for the selected student
  const studentReportDetails = useMemo(() => {
    if (!selectedStudent) return null;

    const gpaItem = gpaReport.find(rep => rep.StudentID === selectedStudent.StudentID) || {
      StudentID: selectedStudent.StudentID,
      StudentName: selectedStudent.StudentName,
      Group: selectedStudent.Group,
      TotalSKS: 0,
      GPA: 0.0,
      SubjectsTaken: 0,
      PassedCredits: 0
    };

    const courseGrades = mergedRecords.filter(rec => rec.StudentID === selectedStudent.StudentID);

    return {
      reportItem: gpaItem,
      grades: courseGrades
    };
  }, [selectedStudent, gpaReport, mergedRecords]);

  // Triggers professional PDF Creation inside PDF document context
  const handleGeneratePDF = () => {
    if (!selectedStudent || !studentReportDetails) return;

    const { reportItem, grades } = studentReportDetails;

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Page size dimensions: A4 is 210mm x 297mm
      const pageWidth = 210;

      // 1. Accent Header Top Bar (Blue branding banner)
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(0, 0, pageWidth, 26, 'F');

      // Header Text inside Top Bar
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('ACADEMIC ANALYTICS PRO', 15, 10);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(191, 219, 254); // blue-200
      doc.text('OFFICIAL ACADEMIC TRANSCRIPT & PERFORMANCE REPORT', 15, 15);
      
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`SYSTEM ID: AAP-2026-${reportItem.StudentID}`, pageWidth - 15, 10, { align: 'right' });
      doc.text(`ISSUED: ${new Date().toLocaleDateString()}`, pageWidth - 15, 15, { align: 'right' });

      // 2. Report Identifier Heading
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // dark slate text
      doc.text('OFFICIAL GRADE REPORT (TRANSCRIPT)', 15, 40);

      // Horizontal separator rule
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.4);
      doc.line(15, 43, pageWidth - 15, 43);

      // 3. Student Identification Bio Table
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(15, 48, pageWidth - 30, 32, 'F');
      
      // Draw dynamic bio borders
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(15, 48, pageWidth - 30, 32, 'S');

      // Identification Labels
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      
      doc.text('Student ID / Registration:', 20, 55);
      doc.text('Full Student Name:', 20, 61);
      doc.text('Classroom Cluster/Group:', 20, 67);
      doc.text('Current Evaluation Period:', 20, 73);

      // Identification Details
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(reportItem.StudentID, 70, 55);
      doc.text(reportItem.StudentName, 70, 61);
      doc.text(`Group / Class - ${reportItem.Group}`, 70, 67);
      doc.setFont('Helvetica', 'normal');
      doc.text('2026/2027 Academic Term (Calculated via SKS Load Index)', 70, 73);

      // 4. Course Catalog Grade List Header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('COURSE COMPILATION & EVALUATION LOGS', 15, 90);

      // Table Column Titles Header Bar
      doc.setFillColor(37, 99, 235); // blue-600 background header
      doc.rect(15, 94, pageWidth - 30, 9, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text('CODE', 18, 100);
      doc.text('COURSE SUBJECT TITLE', 40, 100);
      doc.text('CREDITS (SKS)', 132, 100, { align: 'center' });
      doc.text('RAW SCORE', 160, 100, { align: 'center' });
      doc.text('Ltr GRADE', 185, 100, { align: 'center' });

      // Table course data list rendering
      let currentY = 109;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // slate-700

      if (grades.length === 0) {
        // Render Empty Report row placeholder
        doc.setFillColor(254, 242, 242); // red-50
        doc.rect(15, 103, pageWidth - 30, 12, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(185, 28, 28); // red-700
        doc.text('NO RAW SCORES REGISTERED UNDER THIS COHORT RECORD', pageWidth / 2, 110, { align: 'center' });
        currentY = 120;
      } else {
        grades.forEach((rec, index) => {
          // Row alternation background color
          if (index % 2 === 1) {
            doc.setFillColor(248, 250, 252); // slate-50 background alternation
            doc.rect(15, currentY - 5.5, pageWidth - 30, 8, 'F');
          }

          // Bottom line marker per row
          doc.setDrawColor(241, 245, 249);
          doc.line(15, currentY + 2.5, pageWidth - 15, currentY + 2.5);

          // Content insertion
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(rec.SubjectCode, 18, currentY);

          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          // Crop course string if too long for layout
          const displayCourseName = rec.SubjectName.length > 45 
            ? rec.SubjectName.substring(0, 42) + '...' 
            : rec.SubjectName;
          doc.text(displayCourseName, 40, currentY);

          doc.setFont('Helvetica', 'bold');
          doc.text(`${rec.SKS} SKS`, 132, currentY, { align: 'center' });
          doc.setFont('Helvetica', 'normal');
          doc.text(rec.Score.toString(), 160, currentY, { align: 'center' });

          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(37, 99, 235); // blue letter grades
          doc.text(rec.Grade, 185, currentY, { align: 'center' });

          currentY += 8.2;
        });
      }

      // 5. Final performance metric highlights summary card
      currentY += 4;
      doc.setFillColor(241, 245, 249); // slate-100 summary block
      doc.rect(15, currentY, pageWidth - 30, 24, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200 border
      doc.rect(15, currentY, pageWidth - 30, 24, 'S');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('ACADEMIC SUMMARY INDEX (DF AGGREGATE)', 18, currentY + 6);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Subjects Evaluated: ${reportItem.SubjectsTaken} Taken`, 18, currentY + 13);
      doc.text(`Total Credits Weighted: ${reportItem.TotalSKS} credits loads`, 18, currentY + 19);

      // Cumulative GPA Big highlight
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(`INDEX GPA (IPK): ${reportItem.GPA.toFixed(2)} / 4.00`, 110, currentY + 10);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Evaluated using Formula: Sum(GradePoints * SKS) / Sum(SKS)`, 110, currentY + 15);
      
      // Status message
      const isQualified = reportItem.GPA >= 2.50;
      doc.setFont('Helvetica', 'bold');
      const r = isQualified ? 16 : 220;
      const g = isQualified ? 124 : 38;
      const b = isQualified ? 65 : 38;
      doc.setTextColor(r, g, b);
      doc.text(`STATUS: ${isQualified ? 'ACADEMIC HONOR ROLL (STABLE)' : 'REQUIRES ACADEMIC ADVISING'}`, 110, currentY + 20);

      // 6. Signatures and verification stamps
      currentY += 42;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);

      // Left column: registrar signature line
      doc.line(20, currentY, 75, currentY);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Academic Analytics System', 20, currentY + 4);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Generated via Pandas Python Module', 20, currentY + 8);

      // Right column: student signature line
      doc.line(pageWidth - 75, currentY, pageWidth - 20, currentY);
      doc.setFont('Helvetica', 'bold');
      doc.text('Authorized Signature', pageWidth - 75, currentY + 4);
      doc.setFont('Helvetica', 'normal');
      doc.text('Verified Digital Signature ID', pageWidth - 75, currentY + 8);

      // 7. Small footer notes
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('This is an automated performance audit report calculated live on Google AI Studio sandbox container files.', pageWidth / 2, 283, { align: 'center' });
      doc.text('Data derived from subjects matrix join operations and authenticated spreadsheet uploads.', pageWidth / 2, 286, { align: 'center' });

      // Save PDF down to environment
      doc.save([
        'GPA_Report',
        reportItem.StudentID,
        reportItem.StudentName.replace(/\s+/g, '_')
      ].join('_') + '.pdf');

      setFeedback({
        type: 'success',
        message: `GPA Transcript PDF for ${reportItem.StudentName} (${reportItem.StudentID}) exported successfully!`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Failed to compile PDF: ${err.message || err}`
      });
    }
  };

  return (
    <div id="student-pdf-generator" className="bg-white rounded-xl border border-slate-200 shadow-sm p-4.5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Student Transcript PDF Engine
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Query individual score summaries and download official A4 grade report logs
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition duration-150 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Lookup Form */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Search Cohort Registry
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Type Student Name or Student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-lg py-2 pl-9 pr-4 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 font-medium"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
        </div>

        {/* Search Suggestion Dropdown popup listing matches */}
        {searchResults.length > 0 && (
          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-150 bg-white max-h-36 overflow-y-auto shadow-md scale-in duration-100">
            {searchResults.map((st) => (
              <button
                key={st.StudentID}
                type="button"
                onClick={() => handleSelectStudent(st)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="font-bold text-slate-800">
                  {st.StudentName} <span className="font-semibold text-slate-400 text-[10px]">({st.StudentID})</span>
                </div>
                <span className="text-[9.5px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-semibold font-mono border border-indigo-100">
                  Group {st.Group}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Student Information Panel & Preview and Export Buttons */}
      {selectedStudent ? (
        <div className="mt-3.5 bg-slate-50/70 border border-slate-200 rounded-lg p-3 space-y-3 transition duration-150 relative">
          
          <button 
            type="button"
            onClick={() => setSelectedStudent(null)}
            className="absolute top-2.5 right-2 text-[9.5px] font-bold bg-slate-200/60 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded cursor-pointer transition"
            title="Clear active filter"
          >
            Clear Selected
          </button>

          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] text-white font-mono font-bold select-none shadow">
              {selectedStudent.StudentName.charAt(0)}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {selectedStudent.StudentName}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                ID: {selectedStudent.StudentID} • Group: {selectedStudent.Group}
              </p>
            </div>
          </div>

          {studentReportDetails && (
            <div className="space-y-2 pb-0.5">
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-white p-2 rounded border border-slate-150 font-medium text-slate-600 leading-normal">
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">Total SKS Load</span>
                  <span className="font-bold text-slate-800 font-mono">{studentReportDetails.reportItem.TotalSKS} Credits</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">Subjects Tracked</span>
                  <span className="font-bold text-slate-800 font-mono">{studentReportDetails.reportItem.SubjectsTaken} courses</span>
                </div>
                <div className="col-span-2 pt-1.5 border-t border-slate-100">
                  <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">Calculated Term GPA (IPK)</span>
                  <span className="text-sm font-black text-emerald-600 font-mono tracking-tight">
                    {studentReportDetails.reportItem.GPA.toFixed(2)} / 4.00
                  </span>
                </div>
              </div>

              {/* Course rows preview list */}
              {studentReportDetails.grades.length > 0 ? (
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {studentReportDetails.grades.map(g => (
                    <div key={g.ID} className="flex justify-between items-center text-[10px] bg-white p-1.5 rounded border border-slate-150">
                      <div className="truncate max-w-[150px]">
                        <span className="font-bold text-slate-800 mr-1 font-mono">{g.SubjectCode}</span>
                        <span className="text-slate-600">{g.SubjectName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-400">({g.SKS} SKS)</span>
                        <span className="font-extrabold text-[10px] bg-blue-50 text-blue-800 border border-blue-100 px-1 rounded">
                          {g.Grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">
                  No courses or scoring evaluations found under this student's ID. Exporting PDF will yield an empty grade sheet transcript.
                </p>
              )}

              {/* Real PDF trigger button */}
              <button
                type="button"
                onClick={handleGeneratePDF}
                className="w-full mt-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white hover:text-white rounded-lg font-bold text-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-blue-600/10"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Official PDF Report</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-150 border-dashed rounded-lg p-3.5 text-center flex flex-col items-center justify-center space-y-1.5">
          <FileText className="w-6 h-6 text-slate-305 text-slate-400" />
          <p className="text-[10.5px] font-medium text-slate-500">
            Input a student's ID or name above, or search keywords to view candidate grades and print to PDF.
          </p>
          {/* Quick links containing first 2 students inside dataframe */}
          {students.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center justify-center pt-1">
              <span className="text-[9.5px] text-slate-400 mr-1 font-bold uppercase">Quick View:</span>
              {students.slice(0, 3).map(st => (
                <button
                  key={st.StudentID}
                  type="button"
                  onClick={() => handleSelectStudent(st)}
                  className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded text-[9.5px] font-semibold cursor-pointer transition"
                >
                  {st.StudentName} ({st.StudentID})
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
