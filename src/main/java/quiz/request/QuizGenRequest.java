package quiz.request;

import lombok.Data;

@Data
public class QuizGenRequest {

    private Integer totalQuestions;
    private Integer singleChoice;
    private Integer multipleChoice;
    private Integer trueFalse;
    private String level;
}
