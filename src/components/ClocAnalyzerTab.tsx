import React, { useState, useMemo } from 'react';
import { SWIFT_FILES } from '../data/swiftSources';
import { analyzeSwiftProject, analyzeSwiftCode, generateAnsiTable } from '../utils/clocEngine';
import { soundEngine } from '../utils/audio';
import { SwiftSourceFile } from '../types/clock';
import {
  Terminal,
  FileCode,
  PieChart,
  BarChart3,
  Copy,
  Check,
  Code2,
  FileText,
  Hash,
  Play,
  RotateCcw,
} from 'lucide-react';

export const ClocAnalyzerTab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'project' | 'custom'>('project');
  const [customCode, setCustomCode] = useState<string>(`import Foundation
import Observation

/// Sample Custom Swift File for CLOC Analysis
@Observable
public final class NetworkMonitor: Sendable {
    /* 
     Nested block comment demo:
     /* Inner comment */
    */
    public private(set) var isConnected: Bool = true
    public private(set) var latencyMs: Double = 24.5

    public init() {
        // Start network probe
    }

    public func ping() async -> Bool {
        try? await Task.sleep(for: .milliseconds(50))
        return true
    }
}
`);
  const [isCopied, setIsCopied] = useState(false);
  const [viewStyle, setViewStyle] = useState<'visual' | 'terminal'>('visual');

  // Compute metrics for the Clock Project files
  const projectSummary = useMemo(() => {
    return analyzeSwiftProject(SWIFT_FILES);
  }, []);

  // Compute metrics for custom code
  const customSummary = useMemo(() => {
    const singleResult = analyzeSwiftCode(customCode, 'CustomInput.swift', 'Sources/CustomInput.swift');
    const mockFile: SwiftSourceFile = {
      id: 'custom',
      name: 'CustomInput.swift',
      path: 'Sources/CustomInput.swift',
      category: 'Views',
      description: 'Custom Swift code input',
      code: customCode,
    };
    return analyzeSwiftProject([mockFile]);
  }, [customCode]);

  const currentSummary = activeMode === 'project' ? projectSummary : customSummary;
  const ansiOutput = useMemo(() => generateAnsiTable(currentSummary), [currentSummary]);

  const handleCopyAnsi = () => {
    soundEngine.playHaptic();
    navigator.clipboard.writeText(ansiOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const codePercentage = Math.round((currentSummary.code / (currentSummary.total || 1)) * 100);
  const commentPercentage = Math.round((currentSummary.comment / (currentSummary.total || 1)) * 100);
  const blankPercentage = Math.round((currentSummary.blank / (currentSummary.total || 1)) * 100);

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Swift CLOC <span className="text-amber-500 font-mono text-lg">(Count Lines of Code)</span>
          </h2>
          <div className="text-xs text-zinc-400 mt-0.5">
            Static code analysis & physical SLOC metrics tailored for Swift 6
          </div>
        </div>

        {/* Mode Selector (Project vs Custom) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => {
                soundEngine.playHaptic();
                setActiveMode('project');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeMode === 'project'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Analyze SwiftClock App
            </button>
            <button
              onClick={() => {
                soundEngine.playHaptic();
                setActiveMode('custom');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeMode === 'custom'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Paste Custom Swift
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => {
                soundEngine.playHaptic();
                setViewStyle('visual');
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewStyle === 'visual' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
              }`}
              title="Visual Cards & Tables"
            >
              <BarChart3 size={15} />
            </button>
            <button
              onClick={() => {
                soundEngine.playHaptic();
                setViewStyle('terminal');
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewStyle === 'terminal' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
              }`}
              title="CLI Terminal ANSI Table"
            >
              <Terminal size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Custom code editor if in custom mode */}
      {activeMode === 'custom' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-200">Custom Swift Source Input</span>
            <span>Supports nested /* /* */ */ blocks, docstrings, and macros</span>
          </div>
          <textarea
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            rows={5}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            placeholder="Paste Swift source code here to calculate SLOC..."
          />
        </div>
      )}

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Physical Lines */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Total Lines</span>
            <Hash size={14} className="text-zinc-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {currentSummary.total.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Across {currentSummary.filesCount} file{currentSummary.filesCount > 1 ? 's' : ''}
          </div>
        </div>

        {/* Executable Code Lines (SLOC) */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
            <span>Code (SLOC)</span>
            <Code2 size={14} />
          </div>
          <div className="text-3xl font-bold text-emerald-400 font-mono">
            {currentSummary.code.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {codePercentage}% of total code base
          </div>
        </div>

        {/* Comment Lines */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
            <span>Comments</span>
            <FileText size={14} />
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono">
            {currentSummary.comment.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {commentPercentage}% density (
            {(currentSummary.commentRatio * 100).toFixed(1)}% ratio)
          </div>
        </div>

        {/* Blank Lines */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Blank Lines</span>
            <FileCode size={14} />
          </div>
          <div className="text-3xl font-bold text-zinc-300 font-mono">
            {currentSummary.blank.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {blankPercentage}% whitespace formatting
          </div>
        </div>
      </div>

      {/* Visual Composition Progress Bar */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300">Composition Breakdown</span>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Code {codePercentage}%
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Comments {commentPercentage}%
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              Blank {blankPercentage}%
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${codePercentage}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Code: ${codePercentage}%`}
          />
          <div
            style={{ width: `${commentPercentage}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Comments: ${commentPercentage}%`}
          />
          <div
            style={{ width: `${blankPercentage}%` }}
            className="bg-zinc-600 transition-all duration-500"
            title={`Blank: ${blankPercentage}%`}
          />
        </div>
      </div>

      {/* Language Constructs Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-zinc-300">Swift AST Construct Breakdown:</span>
        <div className="flex items-center flex-wrap gap-4 font-mono">
          <span className="text-zinc-300">
            Structs: <strong className="text-white">{currentSummary.constructsTotal.structs}</strong>
          </span>
          <span className="text-zinc-300">
            Classes: <strong className="text-white">{currentSummary.constructsTotal.classes}</strong>
          </span>
          <span className="text-zinc-300">
            Actors: <strong className="text-white">{currentSummary.constructsTotal.actors}</strong>
          </span>
          <span className="text-zinc-300">
            Protocols: <strong className="text-white">{currentSummary.constructsTotal.protocols}</strong>
          </span>
          <span className="text-zinc-300">
            Functions: <strong className="text-white">{currentSummary.constructsTotal.functions}</strong>
          </span>
          <span className="text-zinc-300">
            Macros: <strong className="text-amber-400">{currentSummary.constructsTotal.macros}</strong>
          </span>
        </div>
      </div>

      {/* Body View: Visual Table OR Terminal ANSI */}
      {viewStyle === 'terminal' ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
              <Terminal size={14} className="text-amber-500" />
              Terminal Output: swift-cloc
            </span>
            <button
              onClick={handleCopyAnsi}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Output</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 font-mono text-xs text-emerald-400 overflow-auto flex-1 leading-relaxed bg-[#0a0a0c]">
            {ansiOutput}
          </pre>
        </div>
      ) : (
        /* Visual Table of Files */
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-lg">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">File-by-File Breakdown</h3>
            <span className="text-xs text-zinc-400 font-mono">
              {currentSummary.files.length} analyzed files
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">File Name</th>
                  <th className="py-2.5 px-4 text-right font-semibold text-zinc-400">Blank</th>
                  <th className="py-2.5 px-4 text-right font-semibold text-amber-400">Comment</th>
                  <th className="py-2.5 px-4 text-right font-semibold text-emerald-400">Code (SLOC)</th>
                  <th className="py-2.5 px-4 text-right font-semibold text-white">Total</th>
                  <th className="py-2.5 px-4 text-right font-semibold text-zinc-400">Constructs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {currentSummary.files.map((file, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-zinc-200 font-semibold flex items-center gap-2">
                      <FileCode size={14} className="text-amber-500 shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{file.fileName}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-zinc-400">{file.blank}</td>
                    <td className="py-2.5 px-4 text-right text-amber-400 font-medium">
                      {file.comment}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                      {file.code}
                    </td>
                    <td className="py-2.5 px-4 text-right text-white font-bold">{file.total}</td>
                    <td className="py-2.5 px-4 text-right text-zinc-500 text-[11px]">
                      {file.structs > 0 && `${file.structs} st `}
                      {file.classes > 0 && `${file.classes} cl `}
                      {file.functions > 0 && `${file.functions} fn`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
