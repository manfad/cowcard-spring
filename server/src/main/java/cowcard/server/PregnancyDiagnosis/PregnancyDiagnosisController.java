package cowcard.server.PregnancyDiagnosis;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/pregnancy-diagnosis")
public class PregnancyDiagnosisController {

    @Autowired
    private PregnancyDiagnosisService pregnancyDiagnosisService;

    @GetMapping("/all")
    public ServerRes<List<PregnancyDiagnosis>> getAll() {
        return ServerRes.success(pregnancyDiagnosisService.findAll());
    }
}
