"use client";
import { useRef, useState } from "react";
import { FileText, UploadCloud, CheckCircle, Trash2 } from "lucide-react";
import { EVENT_TYPES, logEvent } from "@/library/events";

const DEMO_FILES = [
  { id: 1, name: "Retainer-Agreement.pdf", size: "234 KB", version: "v2", updated: "Today", status: "Signed" },
  { id: 2, name: "Client-Onboarding.docx", size: "82 KB", version: "v1", updated: "This week", status: "Draft" },
  { id: 3, name: "Patent-Application.pdf", size: "1.3 MB", version: "v4", updated: "Last month", status: "Submitted" },
  { id: 4, name: "NDA-Sample.docx", size: "98 KB", version: "v1", updated: "Yesterday", status: "Draft" },
  { id: 5, name: "Incorporation-Certificate.pdf", size: "512 KB", version: "v1", updated: "Today", status: "Signed" },
  { id: 6, name: "Trademark-Form.pdf", size: "312 KB", version: "v3", updated: "2 days ago", status: "Submitted" },
  { id: 7, name: "HR-Policy.pdf", size: "1.1 MB", version: "v2", updated: "Last week", status: "Draft" },
  { id: 8, name: "Board-Meeting-Minutes.docx", size: "120 KB", version: "v1", updated: "Today", status: "Signed" },
  { id: 9, name: "Franchise-Agreement.pdf", size: "842 KB", version: "v5", updated: "2 weeks ago", status: "Submitted" },
  { id: 10, name: "Employment-Contract.pdf", size: "314 KB", version: "v1", updated: "Yesterday", status: "Draft" },
  { id: 11, name: "Company-Profile.docx", size: "230 KB", version: "v1", updated: "Today", status: "Signed" },
  { id: 12, name: "Merger-Details.pdf", size: "1.5 MB", version: "v2", updated: "This week", status: "Submitted" },
  { id: 13, name: "Sales-Contract.pdf", size: "725 KB", version: "v4", updated: "3 days ago", status: "Draft" },
  { id: 14, name: "Asset-Transfer.pdf", size: "900 KB", version: "v2", updated: "Today", status: "Signed" },
  { id: 15, name: "Due-Diligence-Checklist.docx", size: "88 KB", version: "v1", updated: "2 weeks ago", status: "Submitted" },
  { id: 16, name: "Vendor-Agreement.pdf", size: "1.0 MB", version: "v3", updated: "Yesterday", status: "Draft" },
  { id: 17, name: "Shareholders-Resolution.pdf", size: "670 KB", version: "v2", updated: "Today", status: "Signed" },
  { id: 18, name: "Licensing-Contract.docx", size: "110 KB", version: "v1", updated: "Last month", status: "Submitted" },
  { id: 19, name: "GDPR-Compliance.pdf", size: "743 KB", version: "v1", updated: "3 days ago", status: "Draft" },
  { id: 20, name: "Investment-Agreement.pdf", size: "1.4 MB", version: "v3", updated: "2 days ago", status: "Submitted" },
  { id: 21, name: "Case-Evidence.pdf", size: "2.3 MB", version: "v1", updated: "Today", status: "Signed" },
  { id: 22, name: "Audit-Report.docx", size: "175 KB", version: "v2", updated: "Yesterday", status: "Draft" },
  { id: 23, name: "Letter-of-Intent.pdf", size: "300 KB", version: "v1", updated: "2 weeks ago", status: "Submitted" },
  { id: 24, name: "Confidentiality-Agreement.pdf", size: "210 KB", version: "v2", updated: "This week", status: "Signed" },
  { id: 25, name: "Service-Agreement.docx", size: "85 KB", version: "v1", updated: "Today", status: "Draft" },
  { id: 26, name: "IPO-Filing.pdf", size: "3.1 MB", version: "v5", updated: "Last week", status: "Submitted" },
  { id: 27, name: "Tax-Declaration.pdf", size: "600 KB", version: "v2", updated: "Today", status: "Signed" },
  { id: 28, name: "Case-Notes.docx", size: "90 KB", version: "v1", updated: "Yesterday", status: "Draft" },
  { id: 29, name: "Settlement-Agreement.pdf", size: "540 KB", version: "v3", updated: "2 days ago", status: "Signed" },
  { id: 30, name: "Legal-Memo.docx", size: "67 KB", version: "v1", updated: "3 days ago", status: "Draft" },
  { id: 31, name: "Client-Review.pdf", size: "478 KB", version: "v2", updated: "Today", status: "Submitted" },
  { id: 32, name: "Litigation-Plan.pdf", size: "1.2 MB", version: "v4", updated: "Last month", status: "Signed" },
  { id: 33, name: "Evidence-Submission.docx", size: "138 KB", version: "v1", updated: "Yesterday", status: "Draft" },
  { id: 34, name: "Risk-Assessment.pdf", size: "888 KB", version: "v2", updated: "Today", status: "Submitted" },
  { id: 35, name: "Annual-Report.pdf", size: "2.5 MB", version: "v3", updated: "This week", status: "Signed" },
  { id: 36, name: "Compliance-Checklist.docx", size: "112 KB", version: "v1", updated: "Yesterday", status: "Draft" },
  { id: 37, name: "Contract-Amendment.pdf", size: "432 KB", version: "v3", updated: "3 days ago", status: "Submitted" },
  { id: 38, name: "Digital-Signature-Policy.pdf", size: "375 KB", version: "v1", updated: "Today", status: "Signed" },
  { id: 39, name: "Court-Notice.pdf", size: "540 KB", version: "v1", updated: "Last week", status: "Draft" },
  { id: 40, name: "Power-of-Attorney.pdf", size: "680 KB", version: "v2", updated: "Yesterday", status: "Submitted" },
  { id: 41, name: "Bank-Authorization.pdf", size: "320 KB", version: "v1", updated: "Today", status: "Signed" },
  { id: 42, name: "Non-Compete-Agreement.pdf", size: "490 KB", version: "v1", updated: "2 weeks ago", status: "Draft" },
  { id: 43, name: "Proposal-Summary.pdf", size: "980 KB", version: "v1", updated: "Today", status: "Submitted" },
  { id: 44, name: "Meeting-Notes.docx", size: "95 KB", version: "v1", updated: "Yesterday", status: "Draft" },
  { id: 45, name: "Legal-Advisory.pdf", size: "660 KB", version: "v2", updated: "2 days ago", status: "Signed" },
  { id: 46, name: "Witness-Statement.pdf", size: "720 KB", version: "v1", updated: "Today", status: "Submitted" },
  { id: 47, name: "Billing-Invoice.pdf", size: "330 KB", version: "v1", updated: "Yesterday", status: "Signed" },
  { id: 48, name: "Court-Filing.pdf", size: "940 KB", version: "v3", updated: "This week", status: "Draft" },
  { id: 49, name: "Expert-Testimony.pdf", size: "1.7 MB", version: "v2", updated: "Today", status: "Submitted" },
  { id: 50, name: "Case-Summary.docx", size: "76 KB", version: "v1", updated: "Yesterday", status: "Draft" },
];

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
