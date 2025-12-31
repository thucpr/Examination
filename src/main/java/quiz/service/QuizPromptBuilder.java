package quiz.service;

import org.springframework.stereotype.Service;
import quiz.request.QuizGenRequest;

@Service
public class QuizPromptBuilder {

    public static String buildPrompt(
            String knowledgeText,
            QuizGenRequest req
    ) {

        int singleChoice = req.getSingleChoice() != null ? req.getSingleChoice() : 0;
        int multipleChoice = req.getMultipleChoice() != null ? req.getMultipleChoice() : 0;
        int trueFalse = req.getTrueFalse() != null ? req.getTrueFalse() : 0;

        int totalQuestions = req.getTotalQuestions() != null
                ? req.getTotalQuestions()
                : singleChoice + multipleChoice + trueFalse;

        return """
                You are an AI quiz generator.
                
                Knowledge source:
                ----------------
                %s
                ----------------
                
                Generate a quiz with the following rules:
                - Total questions: %d
                - Difficulty level: %s
                
                Question structure:
                - %d single-choice questions (ONLY ONE correct answer)
                - %d multiple-choice questions (MORE THAN ONE correct answer)
                - %d true/false questions
                
                Output format (JSON only):
                {
                  "questions": [
                    {
                      "type": "SINGLE | MULTIPLE | TRUE_FALSE",
                      "question": "...",
                      "options": {
                      "A": "...",
                      "B": "...",
                      "C": "...",
                      "D": "..."
                    },
                      "correctAnswers": ["A"]
                    }
                  ]
                }
                
                DO NOT add explanations.
                DO NOT add markdown.
                ONLY return valid JSON.
                """
                .formatted(
                        knowledgeText,
                        totalQuestions,
                        req.getLevel(),
                        singleChoice,
                        multipleChoice,
                        trueFalse
                );
    }
}

