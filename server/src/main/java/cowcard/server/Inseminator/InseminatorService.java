package cowcard.server.Inseminator;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cowcard.server.AiRecord.AiRecordRepository;
import cowcard.server.PregnancyDiagnosis.PregnancyDiagnosisRepository;

@Service
public class InseminatorService {

    @Autowired
    private InseminatorRepository inseminatorRepository;

    @Autowired
    private AiRecordRepository aiRecordRepository;

    @Autowired
    private PregnancyDiagnosisRepository pregnancyDiagnosisRepository;

    public List<Inseminator> findAll() {
        return inseminatorRepository.findAll();
    }

    public List<Inseminator> findAllActive() {
        return inseminatorRepository.findByActiveTrue();
    }

    public Inseminator toggleActive(Integer id) {
        Inseminator e = inseminatorRepository.findById(id).orElseThrow();
        e.setActive(e.getActive() == null || !e.getActive());
        return inseminatorRepository.save(e);
    }

    public Inseminator create(Inseminator inseminator) {
        inseminator.setActive(true);
        return inseminatorRepository.save(inseminator);
    }

    public InseminatorDetail getDetail(Integer id) {
        Inseminator ins = inseminatorRepository.findById(id).orElseThrow();
        List<AiRecordSummaryByInseminator> aiBy = aiRecordRepository.findByAiById(id).stream()
                .map(AiRecordSummaryByInseminator::from).toList();
        List<AiRecordSummaryByInseminator> preparedBy = aiRecordRepository.findByPreparedById(id).stream()
                .map(AiRecordSummaryByInseminator::from).toList();
        List<PdSummary> diagnosisBy = pregnancyDiagnosisRepository.findByDiagnosisById(id).stream()
                .map(PdSummary::from).toList();
        return InseminatorDetail.from(ins, aiBy, preparedBy, diagnosisBy);
    }

    public Inseminator update(Integer id, Inseminator inseminator) {
        Inseminator e = inseminatorRepository.findById(id).orElseThrow();
        e.setName(inseminator.getName());
        e.setRemark(inseminator.getRemark());
        return inseminatorRepository.save(e);
    }
}
