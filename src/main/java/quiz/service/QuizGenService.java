package quiz.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quiz.entity.Quiz;
import quiz.quizutil.QuizParser;
import quiz.repository.QuizRepository;
import quiz.request.QuizGenRequest;
import quiz.response.QuizResponse;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizGenService {

    private final QuizRepository quizRepository;
    private final OllamaService ollamaService;
    private final ObjectMapper objectMapper;

    @Transactional
    public QuizResponse generateQuiz(QuizGenRequest req) throws JsonProcessingException {
        Quiz quiz = quizRepository.findById(1)
                .orElseThrow(() -> new IllegalStateException("No knowledge uploaded"));

        String prompt = buildPrompt(quiz.getContent(), req);

        String aiResult = ollamaService.ask(prompt);

        QuizResponse quizResponse = QuizParser.parse(aiResult);

        Map<String, Object> quizJson = Map.of(
                "questions", quizResponse.getQuestions(),
                "totalQuestions", quizResponse.getQuestions().size(),
                "level", req.getLevel()
        );

        String jsonString = objectMapper.writeValueAsString(quizJson);
        quiz.setQuizJson(jsonString);
        quizRepository.save(quiz);

        return quizResponse;
    }

    private String buildPrompt(String knowledgeText, QuizGenRequest req) {
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


