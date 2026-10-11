import React, { useState } from 'react';
import { SWIFT_FILES } from '../data/swiftSources';
import { SwiftSourceFile } from '../types/clock';
import { soundEngine } from '../utils/audio';
import { Copy, Check, Download, FileCode, Layers, ShieldCheck, Terminal } from 'lucide-react';

export const SwiftCodeInspector: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SwiftSourceFile>(SWIFT_FILES[0]);
  const [isCopied, setIsCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const handleCopy = () => {
    soundEngine.playHaptic();
    navigator.clipboard.writeText(selectedFile.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    soundEngine.playHaptic();
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    soundEngine.playHaptic();
    let bundle = `// SwiftClock Studio - Complete Source Blueprint\n// Generated for Swift 6 & Xcode 16\n\n`;
    SWIFT_FILES.forEach((f) => {
      bundle += `\n// ==========================================\n// File: ${f.path}\n// ==========================================\n\n${f.code}\n`;
    });
    const blob = new Blob([bundle], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SwiftClock-Complete-Source.swift';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Syntax highlighter for Swift
  const renderHighlightedSwift = (code: string) => {
    const lines = code.split('\n');

    return lines.map((line, idx) => {
      // Line formatting
      const isComment = line.trim().startsWith('//') || line.trim().startsWith('///');
      const isDoc = line.trim().startsWith('///');

      return (
        <div key={idx} className="flex hover:bg-zinc-800/40 px-2 py-0.5 rounded leading-relaxed">
          {/* Line number */}
          <span className="w-10 text-right pr-4 text-zinc-600 select-none font-mono text-xs">
            {idx + 1}
          </span>

          {/* Line code content */}
          <span className="font-mono text-xs flex-1 break-all whitespace-pre">
            {isDoc ? (
              <span className="text-zinc-400 italic">{line}</span>
            ) : isComment ? (
              <span className="text-zinc-500 italic">{line}</span>
            ) : (
              highlightSwiftLine(line)
            )}
          </span>
        </div>
      );
    });
  };

  // Basic Swift token coloring
  const highlightSwiftLine = (line: string) => {
    const keywords = [
      'import', 'struct', 'class', 'actor', 'protocol', 'extension', 'enum', 'func',
      'var', 'let', 'public', 'private', 'fileprivate', 'internal', 'final', 'static',
      'guard', 'else', 'if', 'return', 'switch', 'case', 'default', 'while', 'for', 'in',
      'try', 'await', 'async', 'throws', 'mutating', 'self', 'Self', 'true', 'false', 'nil',
      'where', 'some', 'any'
    ];

    const types = [
      'View', 'App', 'Scene', 'WindowGroup', 'Body', 'Text', 'VStack', 'HStack', 'ZStack',
      'Button', 'Color', 'Circle', 'Canvas', 'Date', 'UUID', 'String', 'Int', 'Double',
      'Bool', 'Duration', 'ContinuousClock', 'Task', 'DateComponents', 'TimeZone', 'Calendar',
      'Identifiable', 'Sendable', 'Hashable', 'Codable', 'Observable'
    ];

    const tokens = line.split(/(\s+|[(),.:;{}<>[\]=+\-*/&|!?"'])/);

    return tokens.map((token, i) => {
      if (keywords.includes(token)) {
        return <span key={i} className="text-pink-400 font-semibold">{token}</span>;
      }
      if (types.includes(token)) {
        return <span key={i} className="text-emerald-400 font-medium">{token}</span>;
      }
      if (token.startsWith('@')) {
        return <span key={i} className="text-amber-400 font-semibold">{token}</span>;
      }
      if (token.startsWith('"') && token.endsWith('"')) {
        return <span key={i} className="text-orange-300">{token}</span>;
      }
      if (/^\d+(\.\d+)?$/.test(token)) {
        return <span key={i} className="text-purple-400">{token}</span>;
      }
      return <span key={i} className="text-zinc-200">{token}</span>;
    });
  };

  const filteredFiles = SWIFT_FILES.filter(
    (f) =>
      f.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Swift & SwiftUI Studio
          </h2>
          <div className="text-xs text-zinc-400 mt-0.5">
            Real Swift 6 production architecture for iOS 18 & macOS 15
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded-xl transition-colors cursor-pointer border border-zinc-700"
          >
            <Download size={14} />
            <span>Export All Sources</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-[460px]">
        {/* Left: File Navigator */}
        <div className="md:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode size={14} className="text-amber-500" />
              <span>Project Files ({SWIFT_FILES.length})</span>
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">Swift 6.0</span>
          </div>

          <input
            type="text"
            placeholder="Filter files..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.id === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => {
                    soundEngine.playHaptic();
                    setSelectedFile(file);
                  }}
                  className={`w-full flex flex-col p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/80 text-white shadow-sm'
                      : 'bg-zinc-950/40 border-zinc-850 hover:bg-zinc-800/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold font-mono ${
                        isSelected ? 'text-amber-400' : 'text-zinc-200'
                      }`}
                    >
                      {file.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {file.code.split('\n').length} lines
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 truncate mt-1">
                    {file.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Architecture Badge */}
          <div className="p-2.5 bg-zinc-950/60 border border-zinc-850 rounded-xl text-xs space-y-1 text-zinc-400">
            <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Modern Swift Patterns</span>
            </div>
            <div className="text-[11px] text-zinc-500 leading-normal">
              Uses @Observable macro, ContinuousClock concurrency, UserNotifications, and SwiftUI Canvas.
            </div>
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="md:col-span-8 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-white flex items-center gap-1.5">
                <FileCode size={14} className="text-amber-500" />
                {selectedFile.path}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                title="Copy code"
              >
                {isCopied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadFile}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                title="Download this .swift file"
              >
                <Download size={13} />
              </button>
            </div>
          </div>

          {/* Code Viewer Body */}
          <div className="flex-1 overflow-auto p-3 font-mono text-xs bg-[#0c0d10]">
            {renderHighlightedSwift(selectedFile.code)}
          </div>
        </div>
      </div>
    </div>
  );
};
