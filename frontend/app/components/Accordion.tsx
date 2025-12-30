"use client";

import { useState } from "react";

export default function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-800 text-white rounded-lg mb-3 shadow-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3 text-left font-semibold flex justify-between"
      >
        {title}
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && <div className="p-4 border-t border-gray-700">{children}</div>}
    </div>
  );
}