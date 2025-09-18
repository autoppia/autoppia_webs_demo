"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function MedicalRecordsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
    console.log("upload-record", arr.map((f) => ({ name: f.name, type: f.type, size: f.size })));
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Medical Records</h1>

      <div className="mt-6 max-w-xl space-y-2">
        <Label htmlFor="records">Upload files (PDF or images)</Label>
        <div className="flex gap-2">
          <Input id="records" type="file" accept="application/pdf,image/*" multiple ref={fileRef} />
          <Button onClick={() => addFiles(fileRef.current?.files ?? null)}>Upload Record</Button>
        </div>
        <p className="text-sm text-muted-foreground">Files are not stored. They only appear in the list below for this session.</p>
      </div>

      <ul className="mt-8 divide-y rounded-md border">
        {files.length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">No records uploaded yet.</li>
        )}
        {files.map((f, idx) => (
          <li key={`${f.name}-${idx}`} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="truncate font-medium">{f.name}</div>
              <div className="truncate text-sm text-muted-foreground">{f.type || "unknown"} • {(f.size / 1024).toFixed(1)} KB</div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                console.log("view-record", { index: idx, name: f.name });
              }}
            >
              View Record
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
