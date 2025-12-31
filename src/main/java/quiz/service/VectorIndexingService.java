package quiz.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class VectorIndexingService {

    private final VectorStore vectorStore;
    private final SimpleTextChunker simpleTextChunker;

    private final int CHUNK_SIZE = 4000;
    private final int OVERLAP = 200;
    private final int BATCH_SIZE = 50;

    @Async
    public void indexTextAsync(Long quizId, String content) {
        long t0 = System.currentTimeMillis();
        log.info("Start async vector indexing for quizId={}", quizId);

        Stream<Document> chunkStream = simpleTextChunker.chunkTextLazy(content, CHUNK_SIZE, OVERLAP);

        List<Document> batch = new ArrayList<>(BATCH_SIZE);
        AtomicInteger counter = new AtomicInteger();

        chunkStream.forEach(chunk -> {
            batch.add(chunk);
            if (batch.size() >= BATCH_SIZE) {
                indexBatch(batch, counter.get());
                batch.clear();
                counter.addAndGet(BATCH_SIZE);
            }
        });
        if (!batch.isEmpty()) {
            indexBatch(batch, counter.get());
        }

        log.info("Vector indexing finished: {} ms", System.currentTimeMillis() - t0);
    }

    private void indexBatch(List<Document> batch, int startIndex) {
        try {
            vectorStore.add(batch);
        } catch (Exception e) {
            log.error("Vector indexing failed for batch starting at {}", startIndex, e);
        }
    }
}
