import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Diagram } from "@/components/Diagrams";

/**
 * Renders flashcard content with full Markdown + GFM tables + LaTeX math support.
 *  - Inline math: $...$
 *  - Block math:  $$...$$
 *  - GFM tables, lists, headings, bold, italics
 *  - Fenced ```code``` blocks (preserves ASCII diagrams)
 */
export function RichContent({ text }: { text: string }) {
  if (!text) return null;
  // Strip leaked literal "**bold**" tokens that sometimes appear inside
  // raw HTML <table> cells (Markdown bold isn't parsed inside raw HTML blocks).
  // Convert "**word**" -> "word" so cards never display stray asterisks.
  const cleaned = text.replace(/\*\*(.+?)\*\*/g, "$1");
  return (
    <div className="rich-content text-base md:text-[1.05rem] leading-relaxed text-white">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...p }) => <h2 className="text-xl font-bold mt-4 mb-2" {...p} />,
          h2: ({ node, ...p }) => <h3 className="text-lg font-bold mt-4 mb-2" {...p} />,
          h3: ({ node, ...p }) => <h4 className="text-base font-semibold mt-3 mb-1.5 text-primary" {...p} />,
          h4: ({ node, ...p }) => <h5 className="text-sm font-semibold mt-2 mb-1 uppercase tracking-wide text-muted-foreground" {...p} />,
          p: ({ node, ...p }) => <p className="my-2" {...p} />,
          ul: ({ node, ...p }) => <ul className="list-disc pl-6 space-y-1 my-2" {...p} />,
          ol: ({ node, ...p }) => <ol className="list-decimal pl-6 space-y-1 my-2" {...p} />,
          li: ({ node, ...p }) => <li className="leading-relaxed" {...p} />,
          strong: ({ node, ...p }) => <strong className="font-semibold text-foreground" {...p} />,
          hr: () => <hr className="my-4 border-border/50" />,
          blockquote: ({ node, ...p }) => (
            <blockquote className="border-l-4 border-primary/60 pl-4 italic text-muted-foreground my-3" {...p} />
          ),
          code: ({ node, className, children, ...p }: any) => {
            const isInline = !className;
            if (isInline) {
              return <code className="px-1.5 py-0.5 rounded bg-muted/60 text-sm font-mono" {...p}>{children}</code>;
            }
            // Diagram block: ```diagram closed-loop  (info string starts with "diagram")
            const m = /^language-diagram(?:[-_\s]+(.+))?$/.exec(className || "");
            if (m) {
              const raw = String(children).trim();
              const name = (m[1] || raw.split(/\s+/)[0] || "").trim();
              return <Diagram name={name} />;
            }
            return <code className={className} {...p}>{children}</code>;
          },
          pre: ({ node, children, ...p }: any) => {
            const child: any = Array.isArray(children) ? children[0] : children;
            const cls = child?.props?.className || "";
            if (/^language-diagram/.test(cls)) return <>{children}</>;
            return (
              <pre
                className="rounded-md bg-muted/50 border border-border/50 p-3 my-3 text-xs md:text-sm font-mono overflow-x-auto whitespace-pre leading-snug"
                {...p}
              >
                {children}
              </pre>
            );
          },
          table: ({ node, ...p }) => (
            <div className="my-4 overflow-x-auto rounded-md border border-border/60">
              <table className="w-full text-sm border-collapse" {...p} />
            </div>
          ),
          thead: ({ node, ...p }) => <thead className="bg-muted/60" {...p} />,
          th: ({ node, ...p }) => (
            <th className="text-left p-3 font-semibold border-b border-border/60 align-top" {...p} />
          ),
          td: ({ node, ...p }) => (
            <td className="p-3 border-t border-border/30 align-top" {...p} />
          ),
          a: ({ node, ...p }) => <a className="text-primary underline" target="_blank" rel="noreferrer" {...p} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
