package quiz.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import quiz.entity.Quiz;
import quiz.quizutil.QuizParser;
import quiz.repository.QuizRepository;
import quiz.request.QuizGenRequest;
import quiz.response.QuizResponse;
import quiz.service.OllamaService;
import quiz.service.QuizPromptBuilder;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class QuizController {

    private final QuizRepository quizRepository;

    private final OllamaService ollamaService;

    @PostMapping("/generate")
    public QuizResponse generate(@RequestBody QuizGenRequest req) throws JsonProcessingException {

        Quiz quiz = quizRepository.findById(1)
                .orElseThrow(() -> new IllegalStateException("No knowledge uploaded"));

        String prompt = QuizPromptBuilder.buildPrompt(
                quiz.getContent(),
                req
        );

        String aiResult = ollamaService.ask(prompt);

        QuizResponse quizResponse = QuizParser.parse(aiResult);

        Map<String, Object> quizJson = Map.of(
                "questions", quizResponse.getQuestions(),
                "totalQuestions", quizResponse.getQuestions().size(),
                "level", req.getLevel()
        );

        ObjectMapper mapper = new ObjectMapper();
        String jsonString = mapper.writeValueAsString(quizJson);

        quiz.setQuizJson(jsonString);
        quizRepository.save(quiz);

        return quizResponse;
    }

}
