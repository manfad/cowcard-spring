package cowcard.server.PregnancyDiagnosis;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    public record RegisterCalfRequest(String tag, Integer genderId, String dob,
                                       BigDecimal weight, Integer colorId, Integer feedlotId, String remark,
                                       Boolean stillBirth) {
    }

    @GetMapping("/all")
    public ServerRes<List<PregnancyDiagnosisView>> getAll() {
        return ServerRes.success(pregnancyDiagnosisService.findAll());
    }

    @PutMapping("/{id}/update-status")
    public ServerRes<PregnancyDiagnosis> updateStatus(@PathVariable Integer id,
                                                       @RequestBody UpdatePdStatusRequest request) {
        return ServerRes.success(pregnancyDiagnosisService.updateStatus(id, request.diagnosisById(), request.pdStatusId()));
    }

    @PostMapping("/{id}/register-calf")
    public ServerRes<String> registerCalf(@PathVariable Integer id,
                                           @RequestBody RegisterCalfRequest request) {
        pregnancyDiagnosisService.registerCalf(id, request.tag(), request.genderId(),
                request.dob(), request.weight(), request.colorId(), request.feedlotId(), request.remark(),
                request.stillBirth());
        return ServerRes.success("Calf registered successfully");
    }
}
