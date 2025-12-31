package quiz.service;

import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.stream.Stream;

@Service
public class SimpleTextChunker {

    public Stream<Document> chunkTextLazy(String text, int chunkSize, int overlap) {
        int textLength = text.length();

        return Stream.iterate(0, start -> start < textLength, start -> start + chunkSize - overlap)
                .map(start -> {
                    int end = Math.min(start + chunkSize, textLength);
                    String chunk = text.substring(start, end);
                    return new Document(chunk);
                });
    }
}


