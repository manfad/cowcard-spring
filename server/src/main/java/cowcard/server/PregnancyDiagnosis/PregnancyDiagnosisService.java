package cowcard.server.PregnancyDiagnosis;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PregnancyDiagnosisService {

    @Autowired
    private PregnancyDiagnosisRepository pregnancyDiagnosisRepository;

    public List<PregnancyDiagnosis> findAll() {
        return pregnancyDiagnosisRepository.findAll();
    }
}
