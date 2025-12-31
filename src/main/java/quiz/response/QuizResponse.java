package quiz.response;


import lombok.Data;

import java.util.List;

@Data
public class QuizResponse {

    private List<Question> questions;

    @Data
    public static class Question {

        // SINGLE | MULTIPLE | TRUE_FALSE
        private String type;

        private String question;

        // Danh sách đáp án
        private List<String> options;

        // Danh sách đáp án đúng
        // SINGLE → size = 1
        // MULTIPLE → size >= 2
        // TRUE_FALSE → ["TRUE"] hoặc ["FALSE"]
        private List<String> correctAnswers;
    }
}
