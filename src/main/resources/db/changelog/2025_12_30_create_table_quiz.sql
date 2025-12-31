--changeset ai-quiz:001-create-quiz-table
CREATE TABLE quiz
(
    id         int PRIMARY KEY,
    content    TEXT,
    quiz_json  TEXT,
    updated_at TIMESTAMP
);

DROP TABLE IF EXISTS vector_store CASCADE;

-- Nếu type trùng tên
DROP TYPE IF EXISTS vector_store CASCADE;