package quiz.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "quiz")
public class Quiz {

    @Id
    private Long id;

    @Column(columnDefinition = "text")
    private String content;

    @Column(columnDefinition = "text")
    private String quizJson;
}

