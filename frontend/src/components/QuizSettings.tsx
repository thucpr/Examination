import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle, ListChecks, ToggleLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizSettingsProps {
  onGenerate: (settings: QuizGenerateRequest) => Promise<void>;
  isGenerating: boolean;
}

export interface QuizGenerateRequest {
  totalQuestions: number;
  singleChoice: number;
  multipleChoice: number;
  trueFalse: number;
  level: "EASY" | "MEDIUM" | "HARD";
}

const difficultyLevels = [
  { value: "EASY" as const, label: "Dễ", color: "bg-green-500" },
  { value: "MEDIUM" as const, label: "Trung bình", color: "bg-yellow-500" },
  { value: "HARD" as const, label: "Khó", color: "bg-red-500" },
];

export const QuizSettings = ({ onGenerate, isGenerating }: QuizSettingsProps) => {
  const [singleChoice, setSingleChoice] = useState(2);
  const [multipleChoice, setMultipleChoice] = useState(2);
  const [trueFalse, setTrueFalse] = useState(1);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");

  const totalQuestions = singleChoice + multipleChoice + trueFalse;

  const handleGenerate = async () => {
    await onGenerate({
      totalQuestions,
      singleChoice,
      multipleChoice,
      trueFalse,
      level: difficulty,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Question Types */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Loại câu hỏi</h3>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
            <span className="text-sm font-medium text-primary">
              Tổng: {totalQuestions} câu
            </span>
          </div>
        </div>

        {/* Single Choice */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Single Choice</p>
              <p className="text-sm text-muted-foreground">Câu hỏi 1 đáp án đúng</p>
            </div>
            <span className="text-2xl font-bold text-primary">{singleChoice}</span>
          </div>
          <Slider
            value={[singleChoice]}
            onValueChange={(v) => setSingleChoice(v[0])}
            max={10}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* Multiple Choice */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Multiple Choice</p>
              <p className="text-sm text-muted-foreground">Câu hỏi nhiều đáp án đúng</p>
            </div>
            <span className="text-2xl font-bold text-secondary">{multipleChoice}</span>
          </div>
          <Slider
            value={[multipleChoice]}
            onValueChange={(v) => setMultipleChoice(v[0])}
            max={10}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* True/False */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <ToggleLeft className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">True / False</p>
              <p className="text-sm text-muted-foreground">Câu hỏi đúng/sai</p>
            </div>
            <span className="text-2xl font-bold text-orange-500">{trueFalse}</span>
          </div>
          <Slider
            value={[trueFalse]}
            onValueChange={(v) => setTrueFalse(v[0])}
            max={10}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Độ khó</h3>
        <div className="grid grid-cols-3 gap-3">
          {difficultyLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => setDifficulty(level.value)}
              className={cn(
                "h-12 rounded-xl font-medium transition-all duration-300 border-2",
                difficulty === level.value
                  ? "border-primary bg-primary/10 text-primary shadow-md"
                  : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <span
                  className={cn("w-2 h-2 rounded-full", level.color)}
                />
                {level.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || totalQuestions === 0}
        variant="gradient"
        size="xl"
        className="w-full mt-6"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang tạo quiz...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Tạo Quiz
          </span>
        )}
      </Button>
    </div>
  );
};
