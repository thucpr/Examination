package quiz.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import quiz.request.QuizGenRequest;
import quiz.response.QuizResponse;
import quiz.service.QuizGenService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class QuizController {
    private final QuizGenService quizGenService;

    @PostMapping("/generate")
    public QuizResponse generate(@RequestBody QuizGenRequest req) throws JsonProcessingException {
        return quizGenService.generateQuiz(req);
    }
}
