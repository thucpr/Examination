import { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUploadSuccess: () => void;
  uploadUrl: string;
}

export const FileUpload = ({ onUploadSuccess, uploadUrl }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Chỉ hỗ trợ file PDF, DOCX hoặc TXT");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File không được vượt quá 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsUploaded(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload thất bại");
      }

      setIsUploaded(true);
      onUploadSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi upload");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setIsUploaded(false);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer",
            "hover:border-primary hover:bg-primary/5",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-muted-foreground/30"
          )}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-float">
              <Upload className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                Kéo thả file vào đây
              </p>
              <p className="text-muted-foreground mt-1">
                hoặc click để chọn file
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Hỗ trợ: PDF, DOCX, TXT (tối đa 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm animate-scale-in">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                isUploaded ? "bg-green-100" : "gradient-bg"
              )}
            >
              {isUploaded ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <File className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)}
                {isUploaded && (
                  <span className="text-green-600 ml-2">• Đã upload</span>
                )}
              </p>
            </div>
            {!isUploading && (
              <button
                onClick={removeFile}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {!isUploaded && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={cn(
                "mt-4 w-full h-11 rounded-xl font-semibold transition-all duration-300",
                "gradient-primary text-primary-foreground shadow-md",
                "hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang upload...
                </span>
              ) : (
                "Upload File"
              )}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 animate-fade-in">
          <p className="text-destructive text-sm text-center">{error}</p>
        </div>
      )}
    </div>
  );
};
