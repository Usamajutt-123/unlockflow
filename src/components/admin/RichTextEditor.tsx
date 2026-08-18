"use client";
import { useEffect, useRef } from "react";

// A professional rich-text editor built on contentEditable.
// Toolbar: Paragraph, H1-H4, Bold, Italic, Underline, Strikethrough,
// Bullet list, Numbered list, Quote, Code, Link, Image, Video, Table.

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  // seed content on first mount (don't clobber user edits on re-render)
  useEffect(() => {
    if (firstRun.current && ref.current && value) {
      ref.current.innerHTML = value;
      firstRun.current = false;
    }
  }, [value]);

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const setBlock = (tag: string) => {
    ref.current?.focus();
    exec("formatBlock", tag);
    emit();
  };

  const insertAtSelection = (html: string) => {
    ref.current?.focus();
    document.execCommand("insertHTML", false, html);
    emit();
  };

  const addLink = () => {
    const url = prompt("Enter link URL (https://...)");
    if (url) { exec("createLink", url); emit(); }
  };

  const addImage = () => {
    const url = prompt("Enter image URL");
    if (url) insertAtSelection(`<img src="${url}" alt="" class="rte-img" />`);
  };

  const addVideo = () => {
    const url = prompt("Enter video URL (YouTube/Vimeo)");
    if (!url) return;
    let embed = url;
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (yt) embed = `https://www.youtube.com/embed/${yt[1]}`;
    insertAtSelection(
      `<div class="rte-video"><iframe src="${embed}" allowfullscreen frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`
    );
  };

  const addTable = () => {
    const rows = parseInt(prompt("Rows?", "3") || "3", 10);
    const cols = parseInt(prompt("Columns?", "3") || "3", 10);
    let html = "<table class='rte-table'><tbody>";
    for (let i = 0; i < rows; i++) {
      html += "<tr>";
      for (let j = 0; j < cols; j++) html += "<td>&nbsp;</td>";
      html += "</tr>";
    }
    html += "</tbody></table>";
    insertAtSelection(html);
  };

  const toolbar = [
    { label: "Paragraph", title: "Paragraph", onClick: () => setBlock("p") },
    { label: "H1", title: "Heading 1", onClick: () => setBlock("h1") },
    { label: "H2", title: "Heading 2", onClick: () => setBlock("h2") },
    { label: "H3", title: "Heading 3", onClick: () => setBlock("h3") },
    { label: "H4", title: "Heading 4", onClick: () => setBlock("h4") },
    { label: "B", title: "Bold", onClick: () => exec("bold"), cls: "font-black" },
    { label: "I", title: "Italic", onClick: () => exec("italic"), cls: "italic" },
    { label: "U", title: "Underline", onClick: () => exec("underline"), cls: "underline" },
    { label: "S", title: "Strikethrough", onClick: () => exec("strikeThrough"), cls: "line-through" },
    { label: "• List", title: "Bullet list", onClick: () => exec("insertUnorderedList") },
    { label: "1. List", title: "Numbered list", onClick: () => exec("insertOrderedList") },
    { label: "❝", title: "Quote", onClick: () => setBlock("blockquote") },
    { label: "</>", title: "Code", onClick: () => setBlock("pre") },
    { label: "🔗 Link", title: "Link", onClick: addLink },
    { label: "▧ Image", title: "Image", onClick: addImage },
    { label: "▶ Video", title: "Video", onClick: addVideo },
    { label: "▦ Table", title: "Table", onClick: addTable },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 dark:border-night-700">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-night-700 dark:bg-night-800">
        {toolbar.map((t, i) => (
          <button
            key={i}
            type="button"
            title={t.title}
            onMouseDown={(e) => e.preventDefault()} // keep selection
            onClick={(e) => { e.preventDefault(); t.onClick(); }}
            className={`rounded-md px-2 py-1 text-xs font-semibold transition hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 ${t.cls || ""} text-slate-600 dark:text-slate-300`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="rte-content min-h-[300px] max-h-[480px] overflow-y-auto px-4 py-3 text-sm text-slate-900 outline-none dark:bg-night-900 dark:text-white"
        onInput={emit}
        onBlur={emit}
      />
      {placeholder && <div className="px-2 py-1 text-[10px] text-slate-400">Toolbar formatting is applied to selected text.</div>}
    </div>
  );
}
