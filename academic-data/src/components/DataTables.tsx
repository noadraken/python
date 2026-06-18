import { useState, FormEvent } from 'react';
import { Subject, Student, RawScore } from '../types';
import { Plus, Trash2, Database, Users, BookOpen, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface DataTablesProps {
  subjects: Subject[];
  students: Student[];
  rawScores: RawScore[];
  onAddSubject: (subject: Subject) => void;
  onDeleteSubject: (code: string) => void;
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddScore: (score: RawScore) => void;
  onDeleteScore: (id: number) => void;
  activeSheet: 'subjects' | 'students' | 'rawScores';
  setActiveSheet: (sheet: 'subjects' | 'students' | 'rawScores') => void;
}

export default function DataTables({
  subjects,
  students,
  rawScores,
  onAddSubject,
  onDeleteSubject,
  onAddStudent,
  onDeleteStudent,
  onAddScore,
  onDeleteScore,
  activeSheet,
  setActiveSheet
}: DataTablesProps) {
  // Add Subject Form State
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubSKS, setNewSubSKS] = useState<number>(3);
  const [subError, setSubError] = useState('');

  // Add Student Form State
  const [newStuID, setNewStuID] = useState('');
  const [newStuName, setNewStuName] = useState('');
  const [newStuGroup, setNewStuGroup] = useState('A');
  const [stuError, setStuError] = useState('');

  // Add Score Form State
  const [newScoreSubCode, setNewScoreSubCode] = useState('');
  const [newScoreStuID, setNewScoreStuID] = useState('');
  const [newScoreValue, setNewScoreValue] = useState<number>(85);
  const [scoreError, setScoreError] = useState('');

  // Initialize dropdown defaults when sheets change
  const handleSheetChange = (sheet: 'subjects' | 'students' | 'rawScores') => {
    setActiveSheet(sheet);
    if (sheet === 'rawScores') {
      if (subjects.length > 0) setNewScoreSubCode(subjects[0].Code);
      if (students.length > 0) setNewScoreStuID(students[0].StudentID);
    }
  };

  const handleCreateSubject = (e: FormEvent) => {
    e.preventDefault();
    setSubError('');

    const codeTrim = newSubCode.trim().toUpperCase();
    const nameTrim = newSubName.trim();

    if (!codeTrim || !nameTrim) {
      setSubError('All fields are required.');
      return;
    }

    if (subjects.some(s => s.Code === codeTrim)) {
      setSubError('Subject Code already exists.');
      return;
    }

    if (newSubSKS <= 0 || newSubSKS > 10) {
      setSubError('SKS credits must be between 1 and 10.');
      return;
    }

    onAddSubject({
      Code: codeTrim,
      SubjectName: nameTrim,
      SKS: Number(newSubSKS)
    });

    setNewSubCode('');
    setNewSubName('');
    setNewSubSKS(3);
  };

  const handleCreateStudent = (e: FormEvent) => {
    e.preventDefault();
    setStuError('');

    const idTrim = newStuID.trim().toUpperCase();
    const nameTrim = newStuName.trim();
    const groupTrim = newStuGroup.trim().toUpperCase();

    if (!idTrim || !nameTrim || !groupTrim) {
      setStuError('All fields are required.');
      return;
    }

    if (students.some(s => s.StudentID === idTrim)) {
      setStuError('StudentID already exists.');
      return;
    }

    onAddStudent({
      StudentID: idTrim,
      StudentName: nameTrim,
      Group: groupTrim
    });

    setNewStuID('');
    setNewStuName('');
    setNewStuGroup('A');
  };

  const handleCreateScore = (e: FormEvent) => {
    e.preventDefault();
    setScoreError('');

    const subCode = newScoreSubCode || (subjects.length > 0 ? subjects[0].Code : '');
    const stuID = newScoreStuID || (students.length > 0 ? students[0].StudentID : '');

    if (!subCode || !stuID) {
      setScoreError('Subject and Student must be registered first.');
      return;
    }

    if (newScoreValue < 0 || newScoreValue > 100) {
      setScoreError('Score must be a number between 0 and 100.');
      return;
    }

    // Check if score record already exists for this student and subject
    const alreadyExists = rawScores.some(rs => rs.StudentID === stuID && rs.SubjectCode === subCode);
    if (alreadyExists) {
      setScoreError('Score record for this student and subject already exists.');
      return;
    }

    // Create unique ID
    const nextId = rawScores.length > 0 ? Math.max(...rawScores.map(s => s.ID)) + 1 : 1;

    onAddScore({
      ID: nextId,
      SubjectCode: subCode,
      StudentID: stuID,
      Score: Number(newScoreValue)
    });

    setNewScoreValue(85);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="flex bg-slate-50 border-b border-slate-100 p-1 gap-1">
        <button
          onClick={() => handleSheetChange('subjects')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeSheet === 'subjects'
              ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Subjects Sheet</span>
        </button>
        <button
          onClick={() => handleSheetChange('students')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeSheet === 'students'
              ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Students Sheet</span>
        </button>
        <button
          onClick={() => handleSheetChange('rawScores')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeSheet === 'rawScores'
              ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>RawScores Sheet</span>
        </button>
      </div>

      {/* Sheet Metadata / Explanation Bar */}
      <div className="px-4 py-2 bg-emerald-50/40 border-b border-emerald-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium font-mono">
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Sheets[ &quot;{activeSheet === 'subjects' ? 'Subjects' : activeSheet === 'students' ? 'Students' : 'RawScores'}&quot; ]</span>
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-semibold">
          {activeSheet === 'subjects' ? subjects.length : activeSheet === 'students' ? students.length : rawScores.length} Rows
        </span>
      </div>

      {/* Grid Table Container */}
      <div className="flex-1 overflow-y-auto max-h-[340px] min-h-[220px]">
        {activeSheet === 'subjects' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-5 font-mono">Code (Key)</th>
                <th className="py-3 px-5">Subject Name</th>
                <th className="py-3 px-5 text-center">SKS (Credits)</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
              {subjects.map((sub) => (
                <tr key={sub.Code} className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-5 font-mono font-semibold text-emerald-800">{sub.Code}</td>
                  <td className="py-2.5 px-5 font-medium">{sub.SubjectName}</td>
                  <td className="py-2.5 px-5 text-center font-mono">{sub.SKS} SKS</td>
                  <td className="py-2.5 px-5 text-right">
                    <button
                      onClick={() => onDeleteSubject(sub.Code)}
                      className="p-1 px-2.5 rounded-lg text-rose-500 hover:text-white hover:bg-rose-500 transition-all text-xs inline-flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-5 text-center text-slate-400 text-sm">
                    No subjects registered yet. Make sure to add subjects first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeSheet === 'students' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-5 font-mono">StudentID (Key)</th>
                <th className="py-3 px-5">Student Name</th>
                <th className="py-3 px-5 text-center">Group</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
              {students.map((stu) => (
                <tr key={stu.StudentID} className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-5 font-mono font-semibold text-emerald-800">{stu.StudentID}</td>
                  <td className="py-2.5 px-5 font-medium">{stu.StudentName}</td>
                  <td className="py-2.5 px-5 text-center">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold text-xs border border-indigo-100">
                      Group {stu.Group}
                    </span>
                  </td>
                  <td className="py-2.5 px-5 text-right">
                    <button
                      onClick={() => onDeleteStudent(stu.StudentID)}
                      className="p-1 px-2.5 rounded-lg text-rose-500 hover:text-white hover:bg-rose-500 transition-all text-xs inline-flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-5 text-center text-slate-400 text-sm">
                    No students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeSheet === 'rawScores' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-5 font-mono">ID</th>
                <th className="py-3 px-5 font-mono">SubjectCode</th>
                <th className="py-3 px-5 font-mono">StudentID</th>
                <th className="py-3 px-5 text-center">Score (0-100)</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
              {rawScores.map((score) => (
                <tr key={score.ID} className="hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-5 font-mono text-slate-400 text-xs">{score.ID}</td>
                  <td className="py-2.5 px-5 font-mono text-indigo-600 font-semibold">{score.SubjectCode}</td>
                  <td className="py-2.5 px-5 font-mono font-medium">{score.StudentID}</td>
                  <td className="py-2.5 px-5 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded-md font-semibold ${
                      score.Score >= 85 ? 'bg-emerald-50 text-emerald-800 border-emerald-100 border' :
                      score.Score >= 75 ? 'bg-blue-50 text-blue-800 border-blue-100 border' :
                      score.Score >= 50 ? 'bg-amber-50 text-amber-800 border-amber-100 border' :
                      'bg-rose-50 text-rose-800 border-rose-100 border'
                    }`}>
                      {score.Score}
                    </span>
                  </td>
                  <td className="py-2.5 px-5 text-right">
                    <button
                      onClick={() => onDeleteScore(score.ID)}
                      className="p-1 px-2.5 rounded-lg text-rose-500 hover:text-white hover:bg-rose-500 transition-all text-xs inline-flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {rawScores.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-5 text-center text-slate-400 text-sm">
                    No scores recorded yet. Submit a score record using the form below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom Sheet record insertion Form */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Insert New Row into DataFrame</span>
        </h4>

        {activeSheet === 'subjects' && (
          <form onSubmit={handleCreateSubject} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g., IF104"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineering"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SKS Credits</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newSubSKS}
                  onChange={(e) => setNewSubSKS(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Append df_subjects</span>
                </button>
              </div>
            </div>
            {subError && (
              <p className="text-rose-500 text-xs flex items-center gap-1.5 mt-2 bg-rose-50 border border-rose-100 p-2 rounded-lg font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{subError}</span>
              </p>
            )}
          </form>
        )}

        {activeSheet === 'students' && (
          <form onSubmit={handleCreateStudent} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">StudentID</label>
                <input
                  type="text"
                  placeholder="e.g., S004"
                  value={newStuID}
                  onChange={(e) => setNewStuID(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g., David Alaric"
                  value={newStuName}
                  onChange={(e) => setNewStuName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Group Cohort</label>
                <select
                  value={newStuGroup}
                  onChange={(e) => setNewStuGroup(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                  <option value="C">Group C</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Append df_students</span>
                </button>
              </div>
            </div>
            {stuError && (
              <p className="text-rose-500 text-xs flex items-center gap-1.5 mt-2 bg-rose-50 border border-rose-100 p-2 rounded-lg font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{stuError}</span>
              </p>
            )}
          </form>
        )}

        {activeSheet === 'rawScores' && (
          <form onSubmit={handleCreateScore} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject</label>
                {subjects.length > 0 ? (
                  <select
                    value={newScoreSubCode}
                    onChange={(e) => setNewScoreSubCode(e.target.value)}
                    className="w-full text-xs px-2 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  >
                    {subjects.map(s => (
                      <option key={s.Code} value={s.Code}>{s.Code} - {s.SubjectName}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[11px] text-rose-500 italic">No registered subjects!</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Student</label>
                {students.length > 0 ? (
                  <select
                    value={newScoreStuID}
                    onChange={(e) => setNewScoreStuID(e.target.value)}
                    className="w-full text-xs px-2 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  >
                    {students.map(s => (
                      <option key={s.StudentID} value={s.StudentID}>{s.StudentID} - {s.StudentName}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[11px] text-rose-500 italic">No registered students!</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Numerical Score (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newScoreValue}
                  onChange={(e) => setNewScoreValue(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={subjects.length === 0 || students.length === 0}
                  className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 transition-all flex items-center justify-center gap-2 shadow-sm.shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Append df_scores</span>
                </button>
              </div>
            </div>
            {scoreError && (
              <p className="text-rose-500 text-xs flex items-center gap-1.5 mt-2 bg-rose-50 border border-rose-100 p-2 rounded-lg font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{scoreError}</span>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
