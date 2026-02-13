package cowcard.server.AiRecord;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cowcard.server.CalfRecord.CalfRecordRepository;
import cowcard.server.Cow.Cow;
import cowcard.server.Cow.CowRepository;
import cowcard.server.PregnancyDiagnosis.PregnancyDiagnosis;
import cowcard.server.PregnancyDiagnosis.PregnancyDiagnosisRepository;
import cowcard.server.Semen.Semen;
import cowcard.server.Semen.SemenRepository;
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
    private SemenRepository semenRepository;

    @Autowired
    private CalfRecordRepository calfRecordRepository;

    @Autowired
    private SemenService semenService;

    private static final DateTimeFormatter CODE_DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    public List<AiRecord> findAll() {
        return aiRecordRepository.findAll();
    }

    public AiRecordDetail getDetail(Integer id) {
        AiRecord aiRecord = aiRecordRepository.findById(id).orElseThrow();
        PregnancyDiagnosisItem pdItem = pregnancyDiagnosisRepository
                .findByAiRecordId(id).map(PregnancyDiagnosisItem::from).orElse(null);
        CalfRecordItem calfItem = calfRecordRepository
                .findByAiRecordId(id).map(CalfRecordItem::from).orElse(null);
        return AiRecordDetail.from(aiRecord, pdItem, calfItem);
    }

    public long countNonBullAiRecords(Integer damId) {
        return aiRecordRepository.countByDamIdAndSemenBullFalse(damId);
    }

    public List<DamAiOverview> getDamAiOverview() {
        List<AiRecord> nonBullRecords = aiRecordRepository.findBySemenBullFalseOrderByDamIdAscAiDateAsc();
        return nonBullRecords.stream()
                .collect(Collectors.groupingBy(r -> r.getDam().getId()))
                .entrySet().stream()
                .map(entry -> {
                    List<AiRecord> records = entry.getValue();
                    AiRecord first = records.getFirst();
                    List<AiRecordSummary> summaries = records.stream()
                            .limit(3)
                            .map(AiRecordSummary::from)
                            .toList();
                    return new DamAiOverview(first.getDam().getId(), first.getDam().getTag(), summaries);
                })
                .toList();
    }

    public String generateNextCode() {
        String prefix = LocalDate.now().format(CODE_DATE_FMT);
        long count = aiRecordRepository.countByCodeStartingWith(prefix);
        return prefix + "-" + (count + 1);
    }

    @Transactional
    public AiRecord create(AiRecord aiRecord, Integer semenId) {
        // Validate: dam can only have 3 non-bull AI records
        Semen semen = semenRepository.findById(semenId).orElseThrow();
        if (semen.getBull() == null || !semen.getBull()) {
            long nonBullCount = countNonBullAiRecords(aiRecord.getDam().getId());
            if (nonBullCount >= 3) {
                throw new RuntimeException("This dam already has 3 AI records with non-bull semen. Only bull semen can be used.");
            }
        }

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

        // Deduct 1 straw from non-bull semen only
        if (semen.getBull() == null || !semen.getBull()) {
            semenService.deductStraw(semenId);
        }

        return saved;
    }
}
