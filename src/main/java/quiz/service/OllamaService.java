package quiz.service;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.stereotype.Service;

@Service
public class OllamaService {

    private final OllamaChatModel chatModel;

    public OllamaService(OllamaChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String ask(String promptText) {
        Prompt prompt = new Prompt(promptText);
        ChatResponse response = chatModel.call(prompt);
        return response
                .getResult()
                .getOutput()
                .getText();
    }
}

