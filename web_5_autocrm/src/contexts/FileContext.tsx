"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dynamicDataProvider } from "@/utils/dynamicDataProvider";

interface FileContextType {
  files: any[];
  isLoading: boolean;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    // Initial load
    const loadData = async () => {
      try {
        await dynamicDataProvider.whenReady();
        const loadedFiles = dynamicDataProvider.getFiles();
        if (isMounted) {
          console.log(`📁 Initial files load: ${loadedFiles.length} files`);
          setFiles(loadedFiles);
          if (loadedFiles.length > 0) {
            setIsLoading(false);
          } else if (dynamicDataProvider.isReady()) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to load files:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    const pollForData = () => {
      if (!isMounted) return;

      const currentFiles = dynamicDataProvider.getFiles();
      const currentLength = currentFiles.length;

      setFiles(prevFiles => {
        const prevLength = prevFiles.length;
        if (prevLength !== currentLength) {
          console.log(`📁 Files updated: ${prevLength} → ${currentLength}`);
          return [...currentFiles];
        }
        return prevFiles;
      });

      if (currentLength > 0) {
        setIsLoading(prev => {
          if (prev) {
            console.log("✅ Files data available, stopping loading state");
          }
          return false;
        });
      } else if (dynamicDataProvider.isReady()) {
        setIsLoading(prev => {
          if (prev) {
            console.log("⚠️ Provider ready but no files data");
          }
          return false;
        });
      }
    };

    pollForData();
    pollInterval = setInterval(pollForData, 2000);

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  const value: FileContextType = {
    files,
    isLoading,
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFiles must be used within a FileProvider");
  }
  return context;
}

