import { useState } from 'react';
import { pythonCodeSteps, FullPythonScript, CodeStep } from '../pythonCode';
import { Copy, Check, Code, BookOpen, Terminal, Sparkles, HelpCircle } from 'lucide-react';

interface CodeViewerProps {
  onHighlightStep: (stepId: string | null) => void;
  highlightedStep: string | null;
}

export default function CodeViewer({ onHighlightStep, highlightedStep }: CodeViewerProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'interactive' | 'fullCode'>('interactive');
  const [selectedStep, setSelectedStep] = useState<CodeStep>(pythonCodeSteps[0]);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(FullPythonScript);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleCopySnippet = async (stepId: string, snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippetId(stepId);
      setTimeout(() => setCopiedSnippetId(null), 2000);
    } catch (err) {
      console.error('Failed to copy snippet', err);
    }
  };

  const handleStepSelect = (step: CodeStep) => {
    setSelectedStep(step);
    onHighlightStep(step.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header Tabs */}
      <div className="flex bg-slate-50 border-b border-slate-100 p-1 gap-1">
        <button
          onClick={() => setActiveTab('interactive')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeTab === 'interactive'
              ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100/50'
              : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Interactive Step-by-Step</span>
        </button>
        <button
          onClick={() => setActiveTab('fullCode')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeTab === 'fullCode'
              ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100/50'
              : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100/50'
          }`}
        >
          <Code className="w-4 h-4 text-emerald-600" />
          <span>Complete Python Pandas Script</span>
        </button>
      </div>

      {activeTab === 'interactive' && (
        <div className="flex-1 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 min-h-[460px]">
          {/* Left Navigation: Steps Menu */}
          <div className="w-full sm:w-1/3 bg-slate-50/50 p-2.5 space-y-1 overflow-y-auto max-h-[180px] sm:max-h-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1 block">
              Pandas Pipeline Steps
            </span>
            {pythonCodeSteps.map((step) => {
              const isSelected = selectedStep.id === step.id;
              const isGlobalHighlighted = highlightedStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepSelect(step)}
                  className={`w-full text-left p-2.5 rounded-xl transition duration-200 outline-none flex flex-col gap-0.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                      : isGlobalHighlighted
                      ? 'bg-emerald-50 border border-emerald-100 text-emerald-950'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className={`text-[10px] font-semibold uppercase tracking-wider font-mono ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {step.pandasCommand.split('(')[0]}
                  </span>
                  <span className="text-[13px] font-bold tracking-tight leading-tight block">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Details Panel: Selected Step Details */}
          <div className="flex-1 p-5 flex flex-col justify-between bg-white overflow-y-auto max-h-[380px] sm:max-h-none">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                    {selectedStep.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                    {selectedStep.description}
                  </p>
                </div>
                <button
                  onClick={() => handleCopySnippet(selectedStep.id, selectedStep.codeSnippet)}
                  className="p-1 px-2 border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-all text-[11px] font-semibold text-slate-600 flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedSnippetId === selectedStep.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Box */}
              <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-950">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800/40 text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-semibold">{selectedStep.pandasCommand}</span>
                  </div>
                  <span>python / pandas</span>
                </div>
                <pre className="p-4 overflow-x-auto text-xs text-slate-200 font-mono leading-relaxed whitespace-pre font-medium">
                  <code>{selectedStep.codeSnippet}</code>
                </pre>
              </div>

              {/* Interactive Explanation Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
                <BookOpen className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase">How it works behind the scenes</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {selectedStep.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Learning Objectives footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase border border-indigo-100 flex-shrink-0">
                Learning Objective
              </span>
              <span className="text-xs text-slate-500 font-medium italic">
                {selectedStep.objective}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fullCode' && (
        <div className="p-5 flex-1 flex flex-col justify-between bg-white min-h-[460px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fully-Executable Solution</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  This monolithic Python script executes all learning goals side-by-side using local references. Run it on your local environment by placing `academic_data.xlsx` in the same execution folder.
                </p>
              </div>
              <button
                onClick={handleCopyAll}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl active:scale-95 transition text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-sm shadow-emerald-600/10"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied Code!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Script</span>
                  </>
                )}
              </button>
            </div>

            {/* Complete Monolithic Code window */}
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-950 shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-[10px] font-mono text-slate-500">
                <span className="font-semibold block">academic_gpa_processor.py</span>
                <span>Python Script</span>
              </div>
              <div className="p-4 font-mono text-xs text-slate-200 overflow-y-auto max-h-[300px] leading-relaxed whitespace-pre font-medium scrollbar-thin">
                {FullPythonScript}
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 flex items-start gap-2.5 mt-4">
            <HelpCircle className="w-5 h-5 text-indigo-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 leading-relaxed">
              <span className="font-bold block">Python Workspace Setup Prerequisites</span>
              Make sure you have both `pandas` and the Excel writing engine `xlsxwriter` installed locally to run this pipeline:
              <code className="block mt-1 bg-indigo-950 text-indigo-100 p-1.5 rounded-md font-mono text-[10px]">
                pip install pandas xlsxwriter openpyxl
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
