package cowcard.server.AiRecord;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cowcard.server.Cow.Cow;
import cowcard.server.Cow.CowRepository;
import cowcard.server.PregnancyDiagnosis.PregnancyDiagnosis;
import cowcard.server.PregnancyDiagnosis.PregnancyDiagnosisRepository;
import cowcard.server.Semen.SemenService;

@Service
public class AiRecordService {

    @Autowired
    private AiRecordRepository aiRecordRepository;

    @Autowired
    private PregnancyDiagnosisRepository pregnancyDiagnosisRepository;

    @Autowired
    private CowRepository cowRepository;

    @Autowired
    private SemenService semenService;

    private static final DateTimeFormatter CODE_DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    public List<AiRecord> findAll() {
        return aiRecordRepository.findAll();
    }

    public String generateNextCode() {
        String prefix = LocalDate.now().format(CODE_DATE_FMT);
        long count = aiRecordRepository.countByCodeStartingWith(prefix);
        return prefix + "-" + (count + 1);
    }

    @Transactional
    public AiRecord create(AiRecord aiRecord, Integer semenId) {
        // Auto-generate code
        aiRecord.setCode(generateNextCode());

        // Store the dam's current feedlot name
        Cow dam = cowRepository.findById(aiRecord.getDam().getId()).orElseThrow();
        if (dam.getCurrentFeedlot() != null) {
            aiRecord.setFeedlot(dam.getCurrentFeedlot().getName());
        }

        // Save the AI record
        AiRecord saved = aiRecordRepository.save(aiRecord);

        // Create pregnancy diagnosis linked to this AI record
        PregnancyDiagnosis pd = new PregnancyDiagnosis();
        pd.setAiRecord(saved);
        pd.setAiDate(saved.getAiDate());
        pregnancyDiagnosisRepository.save(pd);

        // Deduct 1 straw from the semen
        semenService.deductStraw(semenId);

        return saved;
    }
}
