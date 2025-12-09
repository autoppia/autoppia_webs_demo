"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, UploadCloud, CheckCircle, Trash2 } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";
import { DEMO_FILES } from "@/library/dataset";
import { DynamicButton } from "@/components/DynamicButton";
import { DynamicContainer, DynamicItem } from "@/components/DynamicContainer";
import { DynamicElement } from "@/components/DynamicElement";
import { useDynamicStructure } from "@/context/DynamicStructureContext";
import { useProjectData } from "@/shared/universal-loader";
import { useSeed } from "@/context/SeedContext";

const normalizeFile = (file: any, index: number) => ({
  id: file?.id ?? index,
  name: file?.name ?? `Document ${index + 1}`,
  size: file?.size ?? "—",
  version: file?.version ?? "v1",
  updated: file?.updated ?? "Today",
  status: file?.status ?? "Draft",
});

const LoadingNotice = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 text-sm text-zinc-500">
    <span className="h-2 w-2 rounded-full bg-accent-forest animate-ping" />
    <span>{message}</span>
  </div>
);

export default function DocumentsPage() {
  const { getText, getId } = useDynamicStructure();
  const { resolvedSeeds } = useSeed();
  const v2Seed = resolvedSeeds.v2 ?? resolvedSeeds.base;
  const { data, isLoading, error } = useProjectData<any>({
    projectKey: "web_5_autocrm",
    entityType: "files",
    seedValue: v2Seed,
  });
  console.log("[DocumentsPage] API response", {
    seed: v2Seed,
    count: data?.length ?? 0,
    isLoading,
    error,
    sample: (data || []).slice(0, 3),
  });
  const normalizedDemo = useMemo(() => DEMO_FILES.map((f, idx) => normalizeFile(f, idx)), []);
  const normalizedApi = useMemo(() => (data || []).map((f, idx) => normalizeFile(f, idx)), [data]);
  const resolvedFiles = normalizedApi.length > 0 ? normalizedApi : normalizedDemo;
  const [files, setFiles] = useState(resolvedFiles);
  const [renamingId, setRenamingId] = useState<number | string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  useEffect(() => {
    if (isLoading) return;
    setFiles(resolvedFiles);
  }, [resolvedFiles, isLoading]);
  const apiError: string | null = error ?? null;
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

  const startRename = (fileId: number | string, current: string) => {
    setRenamingId(fileId);
    setRenameValue(current);
  };

  const saveRename = (fileId: number | string) => {
    if (!renameValue.trim()) return;
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, name: renameValue.trim() } : file
      )
    );
    logEvent(EVENT_TYPES.DOCUMENT_RENAMED, { id: fileId, newName: renameValue.trim() });
    setRenamingId(null);
    setRenameValue("");
  };

  return (
    <DynamicContainer index={0}>
      <DynamicElement elementType="header" index={0}>
        <h1 className="text-3xl font-extrabold mb-10 tracking-tight">
          {getText("documents_title", "Documents")}
          <span className="ml-2 text-base font-medium text-zinc-400 align-middle">
            (Demo)
          </span>
        </h1>
      </DynamicElement>

      {isLoading && (
        <LoadingNotice message={getText("loading_message", "Loading...") ?? "Loading documents..."} />
      )}

      <DynamicElement
        elementType="section"
        index={1}
          className="mb-10 p-8 rounded-2xl border-2 border-dashed border-zinc-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-accent-forest hover:bg-accent-forest/5 transition gap-4 shadow-sm"
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileInput.current && fileInput.current.click()}
        style={{ minHeight: 140 }}
        id={getId("upload_area")}
        aria-label={getText("upload_documents", "Upload Documents")}
      >
        <UploadCloud className="w-9 h-9 text-accent-forest/60 mb-2" />
        <span id={getId("upload_instructions")} className="font-semibold text-accent-forest">
          {getText("upload_instructions", "Upload Instructions")}
        </span>
        <input id={getId("file_input")} data-testid="file-input" type="file" multiple ref={fileInput} onChange={onUpload} className="hidden" />
      </DynamicElement>

        <DynamicElement elementType="section" index={2} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {apiError && (
          <div className="col-span-full text-red-600">Failed to load documents: {apiError}</div>
        )}
        {isLoading && files.length === 0 && (
          <div className="col-span-full text-zinc-500">{getText("loading_message", "Loading...") ?? "Loading documents..."}</div>
        )}
        {files.map((file, index) => (
          <DynamicItem
            key={file.id}
            index={index}
            className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-3 relative group hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-accent-forest">
                <FileText className="w-5 h-5" />
              </div>
              {renamingId === file.id ? (
                <input
                  id={`document-rename-${file.id}`}
                  className="flex-1 border border-zinc-200 rounded-lg px-2 py-1 text-sm"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRename(file.id);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  autoFocus
                />
              ) : (
                <span
                  id={`document-name-${file.id}`}
                  className="font-semibold text-zinc-900 truncate"
                >
                  {file.name}
                </span>
              )}
              <span
                id={`document-version-${file.id}`}
                className="ml-auto text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded font-mono uppercase"
              >
                {file.version}
              </span>
            </div>

            <div
              id={`document-metadata-${file.id}`}
              className="flex gap-3 text-xs text-zinc-500 font-mono"
            >
              <span id={`document-size-${file.id}`}>{file.size}</span>
              <span>·</span>
              <span id={`document-updated-${file.id}`}>{file.updated}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span
                id={`document-status-${file.id}`}
                className={`inline-flex px-3 py-1 rounded-full font-semibold text-xs ${
                  file.status === "Signed"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : file.status === "Submitted"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                }`}
              >
                {file.status}
              </span>
              {file.status === "Signed" && (
                <CheckCircle
                  id={`signed-icon-${file.id}`}
                  className="w-4 h-4 text-emerald-500 ml-1"
                />
              )}
            </div>

            <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              {renamingId === file.id ? (
                <DynamicButton
                  eventType="DOCUMENT_RENAMED"
                  index={index}
                  onClick={() => saveRename(file.id)}
                  className="text-emerald-600 rounded-full hover:bg-emerald-50 px-3 py-1 text-sm border border-emerald-100"
                  id={`${getId("save_document_name")}-${file.id}`}
                  title="Save name"
                >
                  Save
                </DynamicButton>
              ) : (
                <DynamicButton
                  eventType="DOCUMENT_RENAMED"
                  index={index}
                  onClick={() => startRename(file.id, file.name)}
                  className="text-zinc-600 rounded-full hover:bg-zinc-100 px-3 py-1 text-sm border border-zinc-200"
                  id={`${getId("rename_document_button")}-${file.id}`}
                  title="Rename document"
                >
                  Rename
                </DynamicButton>
              )}
              <DynamicButton
                eventType="DOCUMENT_DELETED"
                index={index}
                onClick={() => deleteFile(file.id)}
                className="text-zinc-400 rounded-full hover:bg-red-50 hover:text-red-600 p-2 border border-transparent"
                id={`${getId("delete_document_button")}-${file.id}`}
                title={getText("delete_button", "Delete Button")}
                aria-label={`${getText("delete_button", "Delete Button")} ${file.name}`}
              >
                <Trash2 className="w-5 h-5" />
              </DynamicButton>
            </div>
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
