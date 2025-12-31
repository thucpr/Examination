package quiz.quizutil;

import com.fasterxml.jackson.databind.ObjectMapper;
import quiz.response.QuizResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class QuizParser {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static QuizResponse parse(String aiResult) {
        try {
            String cleanJson = clean(aiResult);

            // 1️⃣ đọc JSON thành Map
            Map<String, Object> map = objectMapper.readValue(cleanJson, Map.class);
            List<Map<String, Object>> questionsRaw = (List<Map<String, Object>>) map.get("questions");

            List<QuizResponse.Question> questions = new ArrayList<>();
            for (Map<String, Object> q : questionsRaw) {
                QuizResponse.Question question = new QuizResponse.Question();
                question.setQuestion((String) q.get("question"));
                question.setType((String) q.get("type"));

                // xử lý options: object → List<String>
                Object opts = q.get("options");
                List<String> optionsList = new ArrayList<>();
                if (opts instanceof List) {
                    optionsList = (List<String>) opts;
                } else if (opts instanceof Map) {
                    optionsList = new ArrayList<>(((Map<?, ?>) opts).values().stream()
                            .map(Object::toString)
                            .toList());
                }
                question.setOptions(optionsList);

                // xử lý correctAnswers
                Object ans = q.get("correctAnswers");
                List<String> answerList = new ArrayList<>();
                if (ans instanceof List) {
                    answerList = ((List<?>) ans).stream()
                            .map(Object::toString)
                            .toList();
                } else if (ans instanceof Map) {
                    answerList = new ArrayList<>(((Map<?, ?>) ans).values().stream()
                            .map(Object::toString)
                            .toList());
                }
                question.setCorrectAnswers(answerList);

                questions.add(question);
            }

            QuizResponse quizResponse = new QuizResponse();
            quizResponse.setQuestions(questions);
            return quizResponse;

        } catch (Exception e) {
            throw new IllegalStateException(
                    "AI response is not valid JSON:\n" + aiResult, e
            );
        }
    }


    private static String clean(String raw) {

        String text = raw.trim();

        // remove ```json or ```
        text = text.replaceAll("```json", "");
        text = text.replaceAll("```", "");

        // extract JSON object only
        int start = text.indexOf("{");
        int end = text.lastIndexOf("}");

        if (start == -1 || end == -1 || start >= end) {
            throw new IllegalStateException("No JSON object found in AI response");
        }

        return text.substring(start, end + 1).trim();
    }
}
