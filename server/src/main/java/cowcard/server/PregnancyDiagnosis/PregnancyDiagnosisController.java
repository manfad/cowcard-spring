package cowcard.server.PregnancyDiagnosis;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/pregnancy-diagnosis")
public class PregnancyDiagnosisController {

    @Autowired
    private PregnancyDiagnosisService pregnancyDiagnosisService;

    public record UpdatePdStatusRequest(Integer diagnosisById, Integer pdStatusId) {
    }

    @GetMapping("/all")
    public ServerRes<List<PregnancyDiagnosis>> getAll() {
        return ServerRes.success(pregnancyDiagnosisService.findAll());
    }

    @PutMapping("/{id}/update-status")
    public ServerRes<PregnancyDiagnosis> updateStatus(@PathVariable Integer id,
                                                       @RequestBody UpdatePdStatusRequest request) {
        return ServerRes.success(pregnancyDiagnosisService.updateStatus(id, request.diagnosisById(), request.pdStatusId()));
    }
}
