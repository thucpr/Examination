import { CheckCircle, ListChecks, ToggleLeft, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id?: number;
  question: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
}

interface QuizResultProps {
  data: any;
}

export const QuizResult = ({ data }: QuizResultProps) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Normalize data - handle different API response structures
  const questions: QuizQuestion[] = Array.isArray(data) 
    ? data 
    : data?.questions || data?.data || [];

  const copyQuestion = async (question: QuizQuestion, index: number) => {
    const text = `${question.question}\n${question.options?.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n') || ''}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SINGLE_CHOICE":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "MULTIPLE_CHOICE":
        return <ListChecks className="w-4 h-4 text-purple-600" />;
      case "TRUE_FALSE":
        return <ToggleLeft className="w-4 h-4 text-orange-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-primary" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "SINGLE_CHOICE":
        return "Single Choice";
      case "MULTIPLE_CHOICE":
        return "Multiple Choice";
      case "TRUE_FALSE":
        return "True/False";
      default:
        return type;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case "SINGLE_CHOICE":
        return "bg-blue-100";
      case "MULTIPLE_CHOICE":
        return "bg-purple-100";
      case "TRUE_FALSE":
        return "bg-orange-100";
      default:
        return "bg-muted";
    }
  };

  if (questions.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-8 border border-border text-center animate-fade-in">
        <p className="text-muted-foreground">Không có câu hỏi nào được tạo</p>
        <pre className="mt-4 text-left text-xs bg-muted p-4 rounded-lg overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          Quiz đã tạo ({questions.length} câu)
        </h2>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={index}
            className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full", getTypeBg(question.type))}>
                  {getTypeIcon(question.type)}
                  <span className="text-xs font-medium">{getTypeLabel(question.type)}</span>
                </div>
              </div>
              <button
                onClick={() => copyQuestion(question, index)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Copy câu hỏi"
              >
                {copiedId === index ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            <p className="text-foreground font-medium mb-3">{question.question}</p>

            {question.options && question.options.length > 0 && (
              <div className="space-y-2">
                {question.options.map((option, optIndex) => {
                  const isCorrect = Array.isArray(question.correctAnswer)
                    ? question.correctAnswer.includes(option)
                    : question.correctAnswer === option;

                  return (
                    <div
                      key={optIndex}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        isCorrect
                          ? "bg-green-50 border-green-200"
                          : "bg-muted/50 border-transparent"
                      )}
                    >
                      <span
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                          isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-muted-foreground/20 text-muted-foreground"
                        )}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className={cn("flex-1", isCorrect && "font-medium text-green-700")}>
                        {option}
                      </span>
                      {isCorrect && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {question.explanation && (
              <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">Giải thích:</span>{" "}
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
