package quiz.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import quiz.entity.Quiz;
import quiz.quizutil.TextExtractor;
import quiz.repository.QuizRepository;

@Service
@RequiredArgsConstructor
@EnableAsync
@Log4j2
public class RagIngestService {

    private final QuizRepository quizRepository;
    private final VectorIndexingService vectorIndexingService;

    @Transactional
    public Quiz ingest(MultipartFile file) throws Exception {
        long t0 = System.currentTimeMillis();

        String content = TextExtractor.extractText(file);
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("File doesn't have content");
        }
        log.info("Extract text: {} ms", System.currentTimeMillis() - t0);

        Quiz quiz = new Quiz();
        quiz.setId(1L);
        quiz.setContent(content);
        quiz = quizRepository.save(quiz);
        log.info("Saved quiz: {} ms", System.currentTimeMillis() - t0);

        vectorIndexingService.indexTextAsync(quiz.getId(), content);
        return quiz;
    }
}




