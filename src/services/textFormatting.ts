// Shared text formatting utilities used by both ScreensFlowEditor (preview) and canvas.ts (export)

export interface TextSegment {
  text: string;
  highlighted: boolean;
}

export interface ParsedLine {
  segments: TextSegment[];
}

// Parse text with [highlighted] syntax and | or \n line breaks
export const parseFormattedText = (text: string): ParsedLine[] => {
  const rawLines = text.split(/\||\n/);

  return rawLines.map(line => {
    const segments: TextSegment[] = [];
    const regex = /\[([^\]]+)\]|([^\[]+)/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match[1]) {
        segments.push({ text: match[1], highlighted: true });
      } else if (match[2]) {
        segments.push({ text: match[2], highlighted: false });
      }
    }

    return { segments };
  });
};

// Measure total width of a line with all its segments
export const measureLineWidth = (ctx: CanvasRenderingContext2D, line: ParsedLine): number => {
  return line.segments.reduce((total, seg) => total + ctx.measureText(seg.text).width, 0);
};

// Wrap formatted text to fit within maxWidth
export const wrapFormattedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): ParsedLine[] => {
  const parsedLines = parseFormattedText(text);
  const wrappedLines: ParsedLine[] = [];

  for (const line of parsedLines) {
    let currentLine: TextSegment[] = [];
    let currentWidth = 0;

    for (const segment of line.segments) {
      const words = segment.text.split(' ');

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const wordWithSpace = i > 0 || currentLine.length > 0 ? ' ' + word : word;
        const wordWidth = ctx.measureText(wordWithSpace).width;

        if (currentWidth + wordWidth > maxWidth && currentLine.length > 0) {
          wrappedLines.push({ segments: currentLine });
          currentLine = [];
          currentWidth = 0;
          currentLine.push({ text: word, highlighted: segment.highlighted });
          currentWidth = ctx.measureText(word).width;
        } else {
          if (currentLine.length > 0 && currentLine[currentLine.length - 1].highlighted === segment.highlighted) {
            currentLine[currentLine.length - 1].text += wordWithSpace;
          } else {
            currentLine.push({ text: wordWithSpace.trimStart() ? wordWithSpace : word, highlighted: segment.highlighted });
          }
          currentWidth += wordWidth;
        }
      }
    }

    if (currentLine.length > 0) {
      wrappedLines.push({ segments: currentLine });
    }
  }

  return wrappedLines;
};
