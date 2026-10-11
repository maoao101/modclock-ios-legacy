import { SwiftClocFileResult, SwiftClocSummary, SwiftSourceFile } from '../types/clock';

export function analyzeSwiftCode(content: string, fileName: string, path: string): SwiftClocFileResult {
  const lines = content.split('\n');
  let blank = 0;
  let comment = 0;
  let docComment = 0;
  let code = 0;
  let inBlockCommentDepth = 0;

  let structs = 0;
  let classes = 0;
  let actors = 0;
  let protocols = 0;
  let functions = 0;
  let macros = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === '') {
      blank++;
      continue;
    }

    // Check if inside nested block comment
    if (inBlockCommentDepth > 0) {
      comment++;
      // Count nested opens and closes
      const opens = (line.match(/\/\*/g) || []).length;
      const closes = (line.match(/\*\//g) || []).length;
      inBlockCommentDepth += opens - closes;
      if (inBlockCommentDepth < 0) inBlockCommentDepth = 0;
      continue;
    }

    if (line.startsWith('///')) {
      docComment++;
      comment++;
    } else if (line.startsWith('//')) {
      comment++;
    } else if (line.startsWith('/*')) {
      comment++;
      const opens = (line.match(/\/\*/g) || []).length;
      const closes = (line.match(/\*\//g) || []).length;
      inBlockCommentDepth += opens - closes;
      if (inBlockCommentDepth < 0) inBlockCommentDepth = 0;
    } else {
      code++;

      // Construct analysis
      if (/\bstruct\s+[A-Za-z0-9_]+/.test(line)) structs++;
      if (/\bclass\s+[A-Za-z0-9_]+/.test(line)) classes++;
      if (/\bactor\s+[A-Za-z0-9_]+/.test(line)) actors++;
      if (/\bprotocol\s+[A-Za-z0-9_]+/.test(line)) protocols++;
      if (/\bfunc\s+[A-Za-z0-9_]+/.test(line)) functions++;
      if (line.startsWith('@')) macros++;
    }
  }

  return {
    fileName,
    path,
    blank,
    comment,
    docComment,
    code,
    total: lines.length,
    structs,
    classes,
    actors,
    protocols,
    functions,
    macros,
  };
}

export function analyzeSwiftProject(files: SwiftSourceFile[]): SwiftClocSummary {
  const fileResults: SwiftClocFileResult[] = files.map(f => analyzeSwiftCode(f.code, f.name, f.path));

  const totalBlank = fileResults.reduce((acc, f) => acc + f.blank, 0);
  const totalComment = fileResults.reduce((acc, f) => acc + f.comment, 0);
  const totalCode = fileResults.reduce((acc, f) => acc + f.code, 0);
  const totalLines = fileResults.reduce((acc, f) => acc + f.total, 0);

  const constructsTotal = {
    structs: fileResults.reduce((acc, f) => acc + f.structs, 0),
    classes: fileResults.reduce((acc, f) => acc + f.classes, 0),
    actors: fileResults.reduce((acc, f) => acc + f.actors, 0),
    protocols: fileResults.reduce((acc, f) => acc + f.protocols, 0),
    functions: fileResults.reduce((acc, f) => acc + f.functions, 0),
    macros: fileResults.reduce((acc, f) => acc + f.macros, 0),
  };

  const commentRatio = totalLines > 0 ? (totalComment / (totalCode + totalComment || 1)) : 0;

  return {
    filesCount: files.length,
    blank: totalBlank,
    comment: totalComment,
    code: totalCode,
    total: totalLines,
    commentRatio,
    files: fileResults,
    constructsTotal,
  };
}

// Generate the authentic CLI-style ASCII table
export function generateAnsiTable(summary: SwiftClocSummary): string {
  const pad = (s: string | number, len: number, alignRight = true) => {
    const str = String(s);
    return alignRight ? str.padStart(len, ' ') : str.padEnd(len, ' ');
  };

  const sep = '--------------------------------------------------------------------------------';
  const lines: string[] = [
    `$ swift-cloc --by-file Sources/`,
    `Analyzing ${summary.filesCount} Swift source files...`,
    sep,
    `${pad('Language', 22, false)} ${pad('Files', 7)} ${pad('Blank', 10)} ${pad('Comment', 11)} ${pad('Code', 11)} ${pad('Total', 11)}`,
    sep,
    `${pad('Swift', 22, false)} ${pad(summary.filesCount, 7)} ${pad(summary.blank, 10)} ${pad(summary.comment, 11)} ${pad(summary.code, 11)} ${pad(summary.total, 11)}`,
    sep,
    `${pad('SUM:', 22, false)} ${pad(summary.filesCount, 7)} ${pad(summary.blank, 10)} ${pad(summary.comment, 11)} ${pad(summary.code, 11)} ${pad(summary.total, 11)}`,
    sep,
    '',
    'File-by-file breakdown:',
    sep,
    `${pad('File', 28, false)} ${pad('Blank', 9)} ${pad('Comment', 11)} ${pad('Code', 11)} ${pad('Total', 11)}`,
    sep,
  ];

  for (const f of summary.files) {
    lines.push(
      `${pad(f.fileName, 28, false)} ${pad(f.blank, 9)} ${pad(f.comment, 11)} ${pad(f.code, 11)} ${pad(f.total, 11)}`
    );
  }

  lines.push(sep);
  lines.push(`Comment Density: ${(summary.commentRatio * 100).toFixed(1)}%`);
  lines.push(
    `AST Constructs: Structs=${summary.constructsTotal.structs} · Classes=${summary.constructsTotal.classes} · Actors=${summary.constructsTotal.actors} · Protocols=${summary.constructsTotal.protocols} · Functions=${summary.constructsTotal.functions} · Macros=${summary.constructsTotal.macros}`
  );

  return lines.join('\n');
}
