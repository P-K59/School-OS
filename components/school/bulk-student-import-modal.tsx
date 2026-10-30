"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Student, GenderType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Users,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Key
} from 'lucide-react';

interface ParsedRow {
  rowNumber: number;
  isValid: boolean;
  error?: string;
  firstName: string;
  lastName: string;
  gradeName: string;
  sectionName: string;
  rollNumber: string;
  gender: GenderType;
  dob: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  email?: string;
  address?: string;
}

interface BulkStudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export function BulkStudentImportModal({ isOpen, onClose, onSuccess }: BulkStudentImportModalProps) {
  const { activeSchool, bulkImportStudents } = useAuth();

  const [step, setStep] = useState<'UPLOAD' | 'PREVIEW' | 'COMPLETE'>('UPLOAD');
  const [rawCsvText, setRawCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'VALID' | 'ERRORS'>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedResults, setImportedResults] = useState<Student[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const sampleCsvContent = `FirstName,LastName,Grade,Section,RollNumber,Gender,DateOfBirth,GuardianName,GuardianPhone,GuardianEmail,Address
Aarav,Verma,Grade 6,A,101,MALE,2013-05-12,Manoj Verma,+91 98230 45678,manoj.verma@example.com,Kalyani Nagar Pune
Diya,Patel,Grade 6,A,102,FEMALE,2013-08-20,Suresh Patel,+91 98230 45679,suresh.patel@example.com,Viman Nagar Pune
Kabir,Sharma,Grade 7,B,201,MALE,2012-03-15,Rajesh Sharma,+91 98230 45680,rajesh.sharma@example.com,Aundh Pune
Ananya,Deshmukh,Grade 8,A,301,FEMALE,2011-11-04,Sanjay Deshmukh,+91 98230 45681,sanjay.deshmukh@example.com,Baner Pune
Rohan,Gupta,Grade 8,B,302,MALE,2011-07-22,Alok Gupta,+91 98230 45682,alok.gupta@example.com,Kothrud Pune`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sample_student_admissions_${activeSchool.code || 'school'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawCsvText(text);
        parseAndValidate(text);
      }
    };
    reader.readAsText(file);
  };

  const parseAndValidate = (csvText: string) => {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setParsedRows([]);
      return;
    }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Find column indexes flexibly
    const findIndex = (patterns: string[]) => {
      return header.findIndex(h => patterns.some(p => h.includes(p)));
    };

    const fnIdx = findIndex(['firstname', 'fname', 'first']);
    const lnIdx = findIndex(['lastname', 'lname', 'last']);
    const gradeIdx = findIndex(['grade', 'class']);
    const secIdx = findIndex(['section', 'sec']);
    const rollIdx = findIndex(['roll', 'rollnumber', 'rollno']);
    const genderIdx = findIndex(['gender', 'sex']);
    const dobIdx = findIndex(['dob', 'dateofbirth', 'birthdate']);
    const parentNameIdx = findIndex(['guardianname', 'parentname', 'father', 'mother', 'parent']);
    const parentPhoneIdx = findIndex(['guardianphone', 'parentphone', 'phone', 'mobile', 'contact']);
    const parentEmailIdx = findIndex(['guardianemail', 'parentemail']);
    const emailIdx = findIndex(['studentemail', 'email']);
    const addressIdx = findIndex(['address', 'city', 'location']);

    const rows: ParsedRow[] = [];
    const seenRollKeys = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const rawCols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (rawCols.length < 3 || rawCols.every(c => !c)) continue;

      const firstName = (fnIdx !== -1 ? rawCols[fnIdx] : rawCols[0]) || '';
      const lastName = (lnIdx !== -1 ? rawCols[lnIdx] : rawCols[1]) || '';
      const gradeName = (gradeIdx !== -1 ? rawCols[gradeIdx] : rawCols[2]) || 'Grade 6';
      const sectionName = (secIdx !== -1 ? rawCols[secIdx] : rawCols[3]) || 'A';
      const rollNumber = (rollIdx !== -1 ? rawCols[rollIdx] : String(i)) || String(i);
      const rawGender = (genderIdx !== -1 ? rawCols[genderIdx]?.toUpperCase() : 'MALE') || 'MALE';
      const gender: GenderType = (rawGender.startsWith('F') ? 'FEMALE' : rawGender.startsWith('O') ? 'OTHER' : 'MALE');
      const dob = (dobIdx !== -1 ? rawCols[dobIdx] : '2013-05-15') || '2013-05-15';
      const parentName = (parentNameIdx !== -1 ? rawCols[parentNameIdx] : 'Parent') || 'Guardian';
      const parentPhone = (parentPhoneIdx !== -1 ? rawCols[parentPhoneIdx] : '+91 98000 00000') || '+91 98000 00000';
      const parentEmail = (parentEmailIdx !== -1 ? rawCols[parentEmailIdx] : undefined);
      const email = (emailIdx !== -1 ? rawCols[emailIdx] : undefined);
      const address = (addressIdx !== -1 ? rawCols[addressIdx] : undefined);

      let error: string | undefined;
      if (!firstName.trim()) error = 'Missing first name';
      else if (!lastName.trim()) error = 'Missing last name';
      else if (!gradeName.trim()) error = 'Missing grade/class';
      else if (!parentName.trim()) error = 'Missing guardian name';
      else if (!parentPhone.trim()) error = 'Missing guardian contact phone';

      // Check roll number uniqueness within batch
      const rollKey = `${gradeName.toLowerCase()}_${sectionName.toLowerCase()}_${rollNumber}`;
      if (!error && rollNumber && seenRollKeys.has(rollKey)) {
        error = `Duplicate Roll #${rollNumber} in ${gradeName}-${sectionName}`;
      }
      seenRollKeys.add(rollKey);

      rows.push({
        rowNumber: i,
        isValid: !error,
        error,
        firstName,
        lastName,
        gradeName,
        sectionName,
        rollNumber,
        gender,
        dob,
        parentName,
        parentPhone,
        parentEmail,
        email,
        address
      });
    }

    setParsedRows(rows);
    setStep('PREVIEW');
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setIsProcessing(true);
    try {
      const result = bulkImportStudents(validRows);
      setImportedResults(result.importedStudents);
      setStep('COMPLETE');
      if (onSuccess) onSuccess(result.successCount);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCredentialsReport = () => {
    if (importedResults.length === 0) return;

    const headers = "StudentName,AdmissionNumber,Grade,Section,RollNumber,CadetLoginID,TemporaryPassword,GuardianName,GuardianPhone";
    const rows = importedResults.map(s => 
      `"${s.firstName} ${s.lastName}","${s.admissionNumber}","${s.gradeName}","${s.sectionName}","${s.rollNumber}","${s.credentials?.loginId || ''}","${s.credentials?.temporaryPassword || ''}","${s.parentName}","${s.parentPhone}"`
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cadet_Credentials_Report_${activeSchool.code || 'school'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const errorCount = parsedRows.filter(r => !r.isValid).length;

  const displayRows = parsedRows.filter(r => {
    if (filterMode === 'VALID') return r.isValid;
    if (filterMode === 'ERRORS') return !r.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <Card className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-indigo-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold">
              <FileSpreadsheet className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                  Bulk Student Admission Engine
                </span>
                <span className="text-xs text-slate-400">• {activeSchool.name}</span>
              </div>
              <h2 className="text-base font-extrabold text-white">Import Students via CSV / Excel</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* STEP 1: UPLOAD / PASTE CSV */}
          {step === 'UPLOAD' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Top Guidance & Sample Download */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <span className="font-extrabold text-indigo-950 block flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Standard Student Admissions CSV Template
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Download our formatted CSV template with pre-mapped columns for Grade, Section, Roll No, and Guardian details.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSample}
                  className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-100 gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </Button>
              </div>

              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-3xl p-8 text-center bg-slate-50/50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Drag &amp; drop your student CSV file here</h3>
                <p className="text-xs text-slate-400 mt-1">Supports standard CSV or UTF-8 text exported from Excel or Google Sheets</p>
                <div className="mt-4">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Choose CSV File</span>
                    <input
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Paste Raw CSV alternative */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700">Or Paste Raw CSV Data Directly</label>
                  <button
                    type="button"
                    onClick={() => {
                      setRawCsvText(sampleCsvContent);
                      parseAndValidate(sampleCsvContent);
                    }}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    Paste Sample Demo Data
                  </button>
                </div>
                <textarea
                  rows={5}
                  placeholder="FirstName,LastName,Grade,Section,RollNumber,Gender,DateOfBirth,GuardianName,GuardianPhone..."
                  value={rawCsvText}
                  onChange={(e) => setRawCsvText(e.target.value)}
                  className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  disabled={!rawCsvText.trim()}
                  onClick={() => parseAndValidate(rawCsvText)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 h-9 rounded-xl shadow-xs gap-1.5 cursor-pointer"
                >
                  <span>Parse &amp; Validate Data</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION TABLE */}
          {step === 'PREVIEW' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Summary Metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-slate-800">Total Rows: {parsedRows.length}</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {validCount} Valid &amp; Ready
                  </span>
                  {errorCount > 0 && (
                    <span className="text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {errorCount} With Issues
                    </span>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFilterMode('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      filterMode === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    All ({parsedRows.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('VALID')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      filterMode === 'VALID' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    Valid ({validCount})
                  </button>
                  {errorCount > 0 && (
                    <button
                      onClick={() => setFilterMode('ERRORS')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        filterMode === 'ERRORS' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-rose-200'
                      }`}
                    >
                      Errors ({errorCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Grade &amp; Sec</th>
                      <th className="py-2.5 px-3">Roll #</th>
                      <th className="py-2.5 px-3">Guardian</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Validation Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {displayRows.map((row) => (
                      <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50/70'}>
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[10px]">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Error
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {row.firstName} {row.lastName}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {row.gradeName} - {row.sectionName}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {row.rollNumber}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {row.parentName}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                          {row.parentPhone}
                        </td>
                        <td className="py-2 px-3 text-[11px]">
                          {row.isValid ? (
                            <span className="text-slate-400">Auto-provisions Cadet ID &amp; Courses</span>
                          ) : (
                            <span className="text-rose-600 font-bold">{row.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('UPLOAD')}
                  className="text-xs border-slate-200"
                >
                  Back to Upload
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {validCount} students will be admitted into {activeSchool.name}
                  </span>
                  <Button
                    size="sm"
                    disabled={validCount === 0 || isProcessing}
                    onClick={handleExecuteImport}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-xs gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isProcessing ? 'Admitting Students...' : `Admit All ${validCount} Valid Students`}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & CREDENTIAL REPORT */}
          {step === 'COMPLETE' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-emerald-950">
                      Successfully Admitted {importedResults.length} Students!
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Cadet credentials and STEM curriculum enrollments have been generated for all admitted students.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleDownloadCredentialsReport}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Credentials Slip (CSV)</span>
                </Button>
              </div>

              {/* Credentials Review Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Admission #</th>
                      <th className="py-2.5 px-3">Class &amp; Roll</th>
                      <th className="py-2.5 px-3">Cadet Login ID</th>
                      <th className="py-2.5 px-3">Temporary Password</th>
                      <th className="py-2.5 px-3">Guardian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {importedResults.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="py-2 px-3 font-mono text-indigo-700 font-bold">
                          {s.admissionNumber}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {s.gradeName} - {s.sectionName} (Roll #{s.rollNumber})
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {s.credentials?.loginId}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {s.credentials?.temporaryPassword}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {s.parentName} ({s.parentPhone})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button
                  onClick={onClose}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-5 rounded-xl cursor-pointer"
                >
                  Done &amp; Return to Directory
                </Button>
              </div>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}
