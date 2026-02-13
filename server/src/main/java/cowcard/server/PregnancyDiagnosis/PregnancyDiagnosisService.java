package cowcard.server.PregnancyDiagnosis;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cowcard.server.Inseminator.Inseminator;
import cowcard.server.PdStatus.PdStatus;

@Service
public class PregnancyDiagnosisService {

    @Autowired
    private PregnancyDiagnosisRepository pregnancyDiagnosisRepository;

    public List<PregnancyDiagnosis> findAll() {
        return pregnancyDiagnosisRepository.findAllOrderByAiRecordAiDateDescIdDesc();
    }

    public PregnancyDiagnosis updateStatus(Integer id, Integer diagnosisById, Integer pdStatusId) {
        PregnancyDiagnosis pd = pregnancyDiagnosisRepository.findById(id).orElseThrow();

        if (diagnosisById != null) {
            Inseminator diagnosisBy = new Inseminator();
            diagnosisBy.setId(diagnosisById);
            pd.setDiagnosisBy(diagnosisBy);
        }

        PdStatus pdStatus = new PdStatus();
        pdStatus.setId(pdStatusId);
        pd.setPdStatus(pdStatus);

        // Auto-set pregnantDate when status is Pregnant (id=3)
        if (pdStatusId == 3) {
            pd.setPregnantDate(LocalDate.now().toString());
        }

        return pregnancyDiagnosisRepository.save(pd);
    }
}
