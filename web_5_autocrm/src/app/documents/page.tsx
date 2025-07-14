"use client";
import { useRef, useState } from "react";
import { FileText, UploadCloud, CheckCircle, Trash2 } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DEMO_FILES } from "@/library/dataset";



export default function DocumentsPage() {
  const [files, setFiles] = useState(DEMO_FILES);
  const fileInput = useRef<HTMLInputElement>(null);

  const onDrop = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    const uploads = Array.from(ev.dataTransfer.files).map((file) => {
      const uploaded = {
        id: Math.random(),
        name: file.name,
        size:
          file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(file.size / 1024).toFixed(1)} KB`,
        version: "v1",
        updated: "Now",
        status: "Draft",
      };
      logEvent(EVENT_TYPES.DOCUMENT_UPLOADED, uploaded);
      return uploaded;
    });
    setFiles((prev) => [...uploads, ...prev]);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const uploads = Array.from(fileList).map((file) => {
      const uploaded = {
        id: Math.random(),
        name: file.name,
        size:
          file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(file.size / 1024).toFixed(1)} KB`,
        version: "v1",
        updated: "Now",
        status: "Draft",
      };
      logEvent(EVENT_TYPES.DOCUMENT_UPLOADED, uploaded);
      return uploaded;
    });

    setFiles((prev) => [...uploads, ...prev]);
  };

  const deleteFile = (id: number) => {
    const fileToDelete = files.find((f) => f.id === id);
    if (fileToDelete) logEvent(EVENT_TYPES.DOCUMENT_DELETED, fileToDelete);
    setFiles((f) => f.filter((fil) => fil.id !== id));
  };

  return (
    <section>
      <h1 className="text-3xl font-extrabold mb-10 tracking-tight">
        Documents
        <span className="ml-2 text-base font-medium text-zinc-400 align-middle">
          (Demo)
        </span>
      </h1>
      <div
        className="mb-10 p-8 rounded-2xl border-2 border-dashed border-accent-forest/40 bg-accent-forest/5 flex flex-col items-center justify-center cursor-pointer hover:bg-accent-forest/10 transition gap-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileInput.current && fileInput.current.click()}
        style={{ minHeight: 140 }}
      >
        <UploadCloud className="w-9 h-9 text-accent-forest/60 mb-2" />
        <span className="font-semibold text-accent-forest">
          Drag & drop to upload, or{" "}
          <span className="underline">browse files</span>
        </span>
        <input
          type="file"
          multiple
          ref={fileInput}
          onChange={onUpload}
          className="hidden"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white rounded-2xl border border-zinc-100 shadow-card p-6 flex flex-col gap-3 relative group hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-7 h-7 text-accent-forest/60" />
              <span className="font-bold text-lg text-zinc-800 truncate">
                {file.name}
              </span>
              <span className="ml-auto text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded font-mono uppercase">
                {file.version}
              </span>
            </div>
            <div className="flex gap-3 text-xs text-zinc-500 font-mono">
              <span>{file.size}</span>
              <span>·</span>
              <span>{file.updated}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`inline-flex px-3 py-1 rounded-2xl font-semibold text-xs ${
                  file.status === "Signed"
                    ? "bg-accent-forest/10 text-accent-forest"
                    : file.status === "Submitted"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {file.status}
              </span>
              {file.status === "Signed" && (
                <CheckCircle className="w-4 h-4 text-accent-forest ml-1" />
              )}
            </div>
            <button
              onClick={() => deleteFile(file.id)}
              className="absolute right-5 top-5 text-zinc-400 rounded-full hover:bg-zinc-100 p-2 opacity-70 group-hover:opacity-100 transition"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center text-zinc-400 text-sm">
        <span>
          <span className="font-semibold text-accent-forest">Premium</span>{" "}
          features: e-sign, versioning, secure sharing, and more coming soon.
        </span>
      </div>
    </section>
  );
}
