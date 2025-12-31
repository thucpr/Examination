package quiz.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import quiz.entity.Quiz;
import quiz.quizutil.TextExtractor;
import quiz.repository.QuizRepository;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class RagIngestService {

    private final VectorStore vectorStore;
    private final QuizRepository quizRepository;
    private final TextExtractor textExtractor;
    private final SimpleTextChunker simpleTextChunker;
    private final int CHUNK_SIZE = 2000;
    private final int OVERLAP = 200;
    private final int BATCH_SIZE = 50;

    public void ingest(MultipartFile file) throws Exception {

        String content = textExtractor.extractText(file);
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("File don't have content");
        }

        Stream<Document> chunkStream = simpleTextChunker.chunkTextLazy(content, 1000, OVERLAP);

        String chunkedText = chunkStream.map(Document::getText)
                .collect(Collectors.joining("\n"));

        Quiz quiz = new Quiz();
        quiz.setId(1L);
        quiz.setContent(chunkedText);
        quizRepository.save(quiz);

        List<Document> chunkList = simpleTextChunker.chunkTextLazy(chunkedText, CHUNK_SIZE, OVERLAP)
                .toList();

        for (int i = 0; i < chunkList.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, chunkList.size());
            vectorStore.add(chunkList.subList(i, end));
        }
    }
}


