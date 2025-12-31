package quiz.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import quiz.service.RagIngestService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class UploadController {

    private final RagIngestService ragIngestService;

    @PostMapping(value = "/quiz/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String uploadPdf(@RequestParam MultipartFile file) throws Exception {
        ragIngestService.ingest(file);
        return "PDF uploaded & replaced";
    }

}
