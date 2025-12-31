import { useState } from "react";
import { Upload, File, X, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:8080/api";

interface QuizQuestion {
  question: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options?: string[];
  correctAnswer?: string | string[];
}

const Index = () => {
  const { toast } = useToast();
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Form state
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [singleChoice, setSingleChoice] = useState(2);
  const [multipleChoice, setMultipleChoice] = useState(2);
  const [trueFalse, setTrueFalse] = useState(1);
  
  // Generate state
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  // File handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({ title: "Lỗi", description: "Chỉ hỗ trợ file PDF, DOCX hoặc TXT", variant: "destructive" });
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({ title: "Lỗi", description: "File không được vượt quá 10MB", variant: "destructive" });
      return;
    }
    setFile(selectedFile);
    setIsFileUploaded(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const uploadFile = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE}/quiz/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload thất bại");
      setIsFileUploaded(true);
      toast({ title: "Thành công!", description: "File đã được tải lên" });
    } catch (err) {
      toast({ title: "Lỗi", description: err instanceof Error ? err.message : "Đã xảy ra lỗi", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setIsFileUploaded(false);
  };

  // Generate handler
  const handleGenerate = async () => {
    if (!isFileUploaded) {
      toast({ title: "Lỗi", description: "Vui lòng upload file trước", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalQuestions: singleChoice + multipleChoice + trueFalse,
          singleChoice,
          multipleChoice,
          trueFalse,
          level: difficulty,
        }),
      });
      if (!response.ok) throw new Error("Tạo quiz thất bại");
      const data = await response.json();
      const quizQuestions = Array.isArray(data) ? data : data?.questions || data?.data || [];
      setQuestions(quizQuestions);
      toast({ title: "Thành công!", description: `Đã tạo ${quizQuestions.length} câu hỏi` });
    } catch (err) {
      toast({ title: "Lỗi", description: err instanceof Error ? err.message : "Đã xảy ra lỗi", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "SINGLE_CHOICE": return "single choice";
      case "MULTIPLE_CHOICE": return "multiple choice";
      case "TRUE_FALSE": return "true/false";
      default: return type;
    }
  };

  const difficultyOptions = [
    { value: "EASY" as const, label: "Easy" },
    { value: "MEDIUM" as const, label: "Medium" },
    { value: "HARD" as const, label: "Hard" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Quiz Generator</h1>
          <p className="text-muted-foreground mt-2">Tạo bài kiểm tra từ tài liệu của bạn</p>
        </div>

        {/* Step 1: Upload Document */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">1</span>
            <h2 className="text-xl font-semibold text-foreground">Upload Document</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-4">Upload your document to generate exam questions</p>

          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                isDragging ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer inline-block">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
              </label>
              <p className="font-medium text-foreground mt-3">Kéo thả file hoặc click icon để chọn</p>
              <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, TXT (tối đa 10MB)</p>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <File className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                  {isFileUploaded && <span className="text-green-600 ml-2">• Đã upload</span>}
                </p>
              </div>
              {!isFileUploaded && (
                <Button onClick={uploadFile} disabled={isUploading} size="sm">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                </Button>
              )}
              <button onClick={removeFile} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Main Content: 2 columns */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Exam Configuration */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">2</span>
              <h2 className="text-xl font-semibold text-foreground">Exam Configuration</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">Configure the exam parameters</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Topic/Subject (Optional)</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Data Structures, History, Mathematics"
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-detect from uploaded documents</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-foreground mb-2">Difficulty</label>
                  <button
                    onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-left flex items-center justify-between"
                  >
                    <span>{difficultyOptions.find(d => d.value === difficulty)?.label}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {showDifficultyDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10">
                      {difficultyOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setDifficulty(opt.value); setShowDifficultyDropdown(false); }}
                          className="w-full px-3 py-2 text-left hover:bg-muted text-foreground first:rounded-t-lg last:rounded-b-lg"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Total Questions</label>
                  <Input
                    type="number"
                    value={singleChoice + multipleChoice + trueFalse}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Question Type Distribution */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Question Types</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Single Choice</label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={singleChoice}
                      onChange={(e) => setSingleChoice(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Multiple Choice</label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={multipleChoice}
                      onChange={(e) => setMultipleChoice(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">True/False</label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={trueFalse}
                      onChange={(e) => setTrueFalse(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !isFileUploaded}
                variant="gradient"
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Exam from Documents
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right: Generated Exam */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">3</span>
              <h2 className="text-xl font-semibold text-foreground">Generated Exam</h2>
            </div>
            
            {questions.length > 0 ? (
              <>
                <p className="text-muted-foreground text-sm mb-6">
                  {questions.length} questions generated from <span className="text-primary font-medium">1 document(s)</span>
                </p>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {questions.map((q, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <p className="font-medium text-foreground flex-1">{q.question}</p>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded shrink-0">
                          {getTypeLabel(q.type)}
                        </span>
                      </div>
                      {q.options && (
                        <ul className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = Array.isArray(q.correctAnswer)
                              ? q.correctAnswer.includes(opt)
                              : q.correctAnswer === opt;
                            return (
                              <li 
                                key={optIdx} 
                                className={cn(
                                  "flex items-center gap-2 text-sm px-2 py-1 rounded",
                                  isCorrect ? "bg-green-100 text-green-700 font-medium" : "text-muted-foreground"
                                )}
                              >
                                <span className={cn(
                                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                                  isCorrect ? "bg-green-500 text-white" : "bg-muted-foreground/20"
                                )}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                {opt}
                                {isCorrect && <span className="ml-auto text-green-600">✓</span>}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Chưa có câu hỏi nào</p>
                <p className="text-sm text-muted-foreground mt-1">Upload file và nhấn Generate để tạo quiz</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
