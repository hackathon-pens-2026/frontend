import { Fragment } from "react";

function inlineText(text: string) {
  return text.split(/(\*\*[^*\n]+\*\*|(?<!\*)\*[^*\n]+\*(?!\*)|`[^`\n]+`)/g).map((part, index) => {
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-line/50 px-1 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

type Block =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "list"; ordered: boolean; items: { text: string; number?: number }[] };

function messageBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | undefined;
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (!line.trim()) {
      current = undefined;
      continue;
    }
    const bullet = /^\s*[-*•]\s+(.+)$/.exec(line);
    const numbered = /^\s*(\d+)[.)]\s+(.+)$/.exec(line);
    const itemText = bullet?.[1] ?? numbered?.[2];
    if (itemText !== undefined) {
      const ordered = Boolean(numbered);
      if (current?.kind !== "list" || current.ordered !== ordered) {
        current = { kind: "list", ordered, items: [] };
        blocks.push(current);
      }
      current.items.push({ text: itemText, number: numbered ? Number(numbered[1]) : undefined });
    } else {
      if (current?.kind !== "paragraph") {
        current = { kind: "paragraph", lines: [] };
        blocks.push(current);
      }
      current.lines.push(line);
    }
  }
  return blocks;
}

export function MessageContent({ text, formatted = true }: { text: string; formatted?: boolean }) {
  if (!formatted) return <div className="whitespace-pre-wrap [overflow-wrap:anywhere]">{text}</div>;

  return (
    <div className="space-y-3 [overflow-wrap:anywhere]">
      {messageBlocks(text).map((block, index) => {
        if (block.kind === "paragraph") {
          return <p key={index} className="whitespace-pre-wrap">{inlineText(block.lines.join("\n"))}</p>;
        }
        const items = block.items.map((item, itemIndex) => (
          <li key={itemIndex} value={item.number} className="pl-1">{inlineText(item.text)}</li>
        ));
        return block.ordered
          ? <ol key={index} start={block.items[0]?.number} className="list-outside list-decimal space-y-1.5 pl-5">{items}</ol>
          : <ul key={index} className="list-outside list-disc space-y-1.5 pl-5">{items}</ul>;
      })}
    </div>
  );
}
