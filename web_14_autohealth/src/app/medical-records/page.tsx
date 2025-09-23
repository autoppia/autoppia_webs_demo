"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { logEvent, EVENT_TYPES } from "@/library/events";
import { medicalRecords, type MedicalRecord } from "@/data/medical-records";

export default function MedicalRecordsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
    
    // Log upload event
    logEvent(EVENT_TYPES.UPLOAD_HEALTH_DATA, {
      files: arr.map((f) => ({ 
        name: f.name, 
        type: f.type, 
        size: f.size 
      }))
    });
    
    if (fileRef.current) fileRef.current.value = "";
  }

  const handleViewRecord = (record: MedicalRecord) => {
    logEvent(EVENT_TYPES.VIEW_HEALTH_METRICS, {
      recordId: record.id,
      recordType: record.type,
      recordTitle: record.title,
      recordDate: record.date
    });
    setSelectedRecord(record);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-green-100 text-green-800";
      case "abnormal": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lab_result": return "🧪";
      case "imaging": return "📷";
      case "vaccination": return "💉";
      case "visit_summary": return "📋";
      case "prescription_history": return "💊";
      case "allergy": return "⚠️";
      case "vital_signs": return "❤️";
      case "procedure": return "🏥";
      default: return "📄";
    }
  };

  const categories = ["all", "diagnostic", "preventive", "treatment", "monitoring"];
  const filteredRecords = selectedCategory === "all" 
    ? medicalRecords 
    : medicalRecords.filter(record => record.category === selectedCategory);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Medical Records</h1>

      {/* Category Filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedCategory(category);
              logEvent(EVENT_TYPES.FILTER_BY_SPECIALTY, { category });
            }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Upload Section */}
      <div className="mt-8 max-w-xl space-y-2">
        <Label htmlFor="records">Upload additional files (PDF or images)</Label>
        <div className="flex gap-2">
          <Input id="records" type="file" accept="application/pdf,image/*" multiple ref={fileRef} />
          <Button onClick={() => addFiles(fileRef.current?.files ?? null)}>Upload Record</Button>
        </div>
        <p className="text-sm text-muted-foreground">Files are not stored. They only appear in the list below for this session.</p>
      </div>

      {/* Medical Records Grid */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(record.type)}</span>
                  <CardTitle className="text-base">{record.title}</CardTitle>
                </div>
                <Badge className={getStatusColor(record.status)}>
                  {record.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {record.date} • {record.doctorName}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {record.description}
              </p>
              <Button
                size="sm"
                onClick={() => handleViewRecord(record)}
                className="w-full"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Uploaded Files Section */}
      {files.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Uploaded Files</h2>
          <ul className="divide-y rounded-md border">
            {files.map((f, idx) => (
              <li key={`${f.name}-${idx}`} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="truncate font-medium">{f.name}</div>
                  <div className="truncate text-sm text-muted-foreground">{f.type || "unknown"} • {(f.size / 1024).toFixed(1)} KB</div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    logEvent(EVENT_TYPES.VIEW_HEALTH_METRICS, { 
                      index: idx, 
                      fileName: f.name,
                      fileType: f.type,
                      fileSize: f.size
                    });
                  }}
                >
                  View Record
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(selectedRecord.type)}</span>
                <h2 className="text-xl font-semibold">{selectedRecord.title}</h2>
              </div>
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Date:</span> {selectedRecord.date}
                </div>
                <div>
                  <span className="font-medium">Doctor:</span> {selectedRecord.doctorName}
                </div>
                <div>
                  <span className="font-medium">Facility:</span> {selectedRecord.facility}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <Badge className={`ml-2 ${getStatusColor(selectedRecord.status)}`}>
                    {selectedRecord.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-muted-foreground">{selectedRecord.description}</p>
              </div>

              {selectedRecord.values && (
                <div>
                  <span className="font-medium">Results/Values:</span>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(selectedRecord.values).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
