"use client";
import { useRef, useState } from "react";
import { FileText, UploadCloud, CheckCircle, Trash2 } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DEMO_FILES } from "@/library/dataset";
import { useProjectData } from "@/shared/universal-loader";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { DynamicElement } from "@/components/DynamicElement";

export default function DocumentsPage() {
  const { data, isLoading, error } = useProjectData<any>({
    projectKey: 'web_5_autocrm:files',
    entityType: 'files',
    generateCount: 30,
    version: 'v1',
    fallback: () => DEMO_FILES,
  });
  const [files, setFiles] = useState(
    (data && data.length ? data : DEMO_FILES).map((f: any, idx: number) => ({
      id: f.id ?? idx + 1,
      name: f.name ?? `Document-${idx + 1}.pdf`,
      size: f.size ?? '200 KB',
      version: f.version ?? 'v1',
      updated: f.updated ?? 'Today',
      status: f.status ?? 'Draft',
    }))
  );
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
    <DynamicContainer index={0}>
      <DynamicElement elementType="header" index={0}>
        <h1 className="text-3xl font-extrabold mb-10 tracking-tight">
          Documents
          <span className="ml-2 text-base font-medium text-zinc-400 align-middle">
            (Demo)
          </span>
        </h1>
      </DynamicElement>

      <DynamicElement
        elementType="section"
        index={1}
        className="mb-10 p-8 rounded-2xl border-2 border-dashed border-accent-forest/40 bg-accent-forest/5 flex flex-col items-center justify-center cursor-pointer hover:bg-accent-forest/10 transition gap-4"
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileInput.current && fileInput.current.click()}
        style={{ minHeight: 140 }}
      >
        <UploadCloud className="w-9 h-9 text-accent-forest/60 mb-2" />
        <span id="upload-instructions" className="font-semibold text-accent-forest">
          Drag & drop to upload, or <span className="underline">browse files</span>
        </span>
        <input id="file-input" data-testid="file-input" type="file" multiple ref={fileInput} onChange={onUpload} className="hidden" />
      </DynamicElement>

      <DynamicElement elementType="section" index={2} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {error && (
          <div className="col-span-full text-red-600">Failed to load documents: {error}</div>
        )}
        {files.map((file, index) => (
          <DynamicItem key={file.id} index={index} className="bg-white rounded-2xl border border-zinc-100 shadow-card p-6 flex flex-col gap-3 relative group hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-7 h-7 text-accent-forest/60" />
              <span id={`document-name-${file.id}`} className="font-bold text-lg text-zinc-800 truncate">{file.name}</span>
              <span id={`document-version-${file.id}`} className="ml-auto text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded font-mono uppercase">{file.version}</span>
            </div>

            <div id={`document-metadata-${file.id}`} className="flex gap-3 text-xs text-zinc-500 font-mono">
              <span id={`document-size-${file.id}`}>{file.size}</span>
              <span>·</span>
              <span id={`document-updated-${file.id}`}>{file.updated}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span id={`document-status-${file.id}`} className={`inline-flex px-3 py-1 rounded-2xl font-semibold text-xs ${file.status === "Signed" ? "bg-accent-forest/10 text-accent-forest" : file.status === "Submitted" ? "bg-blue-100 text-blue-600" : "bg-zinc-200 text-zinc-500"}`}>
                {file.status}
              </span>
              {file.status === "Signed" && <CheckCircle id={`signed-icon-${file.id}`} className="w-4 h-4 text-accent-forest ml-1" />}
            </div>

            <DynamicButton eventType="DOCUMENT_DELETED" index={index} onClick={() => deleteFile(file.id)} className="absolute right-5 top-5 text-zinc-400 rounded-full hover:bg-zinc-100 p-2 opacity-70 group-hover:opacity-100 transition" title="Delete" aria-label={`Delete ${file.name}`}>
              <Trash2 className="w-5 h-5" />
            </DynamicButton>
          </DynamicItem>
        ))}
      </DynamicElement>

      <DynamicElement elementType="section" index={3} className="mt-12 text-center text-zinc-400 text-sm">
        <span>
          <span className="font-semibold text-accent-forest">Premium</span> features: e-sign, versioning, secure sharing, and more coming soon.
        </span>
      </DynamicElement>
    </DynamicContainer>
  );
}
