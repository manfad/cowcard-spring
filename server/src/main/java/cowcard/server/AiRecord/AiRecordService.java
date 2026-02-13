package cowcard.server.AiRecord;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cowcard.server.AiStatus.AiStatus;
import cowcard.server.CalfRecord.CalfRecordRepository;
import cowcard.server.Cow.Cow;
import cowcard.server.Cow.CowRepository;
import cowcard.server.PdStatus.PdStatus;
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

    public List<DamAiRecord> getDamAiRecord() {
        List<AiRecord> nonBullRecords = aiRecordRepository.findBySemenBullFalseOrderByDamIdAscAiDateAsc();
        List<AiRecord> bullRecords = aiRecordRepository.findBySemenBullTrueOrderByDamIdAscAiDateAsc();

        Map<Integer, List<AiRecord>> nonBullByDam = nonBullRecords.stream()
                .collect(Collectors.groupingBy(r -> r.getDam().getId()));
        Map<Integer, List<AiRecord>> bullByDam = bullRecords.stream()
                .collect(Collectors.groupingBy(r -> r.getDam().getId()));

        // Collect all dam IDs from both maps
        Map<Integer, AiRecord> damSamples = new HashMap<>();
        nonBullRecords.forEach(r -> damSamples.putIfAbsent(r.getDam().getId(), r));
        bullRecords.forEach(r -> damSamples.putIfAbsent(r.getDam().getId(), r));

        return damSamples.entrySet().stream()
                .map(entry -> {
                    Integer damId = entry.getKey();
                    AiRecord sample = entry.getValue();

                    List<AiRecordSummary> aiSummaries = nonBullByDam.getOrDefault(damId, List.of()).stream()
                            .limit(3)
                            .map(AiRecordSummary::from)
                            .toList();

                    List<BullAiSummary> bullSummaries = bullByDam.getOrDefault(damId, List.of()).stream()
                            .map(BullAiSummary::from)
                            .toList();

                    // Calculate lastAiDays from most recent AI record (any type)
                    Integer lastAiDays = null;
                    List<AiRecord> allDamRecords = aiRecordRepository.findByDamIdOrderByAiDateDesc(damId);
                    if (!allDamRecords.isEmpty()) {
                        String mostRecentAiDate = allDamRecords.getFirst().getAiDate();
                        if (mostRecentAiDate != null && !mostRecentAiDate.isBlank()) {
                            LocalDate aiDate = LocalDate.parse(mostRecentAiDate);
                            lastAiDays = (int) ChronoUnit.DAYS.between(aiDate, LocalDate.now());
                        }
                    }

                    return new DamAiRecord(
                            damId,
                            sample.getDam().getTag(),
                            aiSummaries,
                            bullSummaries,
                            lastAiDays);
                })
                .toList();
    }

    public String generateNextCode() {
        String prefix = LocalDate.now().format(CODE_DATE_FMT);
        long count = aiRecordRepository.countByCodeStartingWith(prefix);
        return prefix + "-" + (count + 1);
    }

    @Transactional
    public AiRecord updateStatus(Integer id, Integer aiStatusId) {
        AiRecord aiRecord = aiRecordRepository.findById(id).orElseThrow();

        AiStatus aiStatus = new AiStatus();
        aiStatus.setId(aiStatusId);
        aiRecord.setStatus(aiStatus);
        aiRecordRepository.save(aiRecord);

        // If fail (id=2), cascade to pregnancy diagnosis
        if (aiStatusId == 2) {
            pregnancyDiagnosisRepository.findByAiRecordId(id).ifPresent(pd -> {
                PdStatus pdStatus = new PdStatus();
                pdStatus.setId(2);
                pd.setPdStatus(pdStatus);
                pregnancyDiagnosisRepository.save(pd);
            });
        }

        return aiRecord;
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

        // Set default AI status (id=3)
        AiStatus defaultAiStatus = new AiStatus();
        defaultAiStatus.setId(3);
        aiRecord.setStatus(defaultAiStatus);

        // Save the AI record
        AiRecord saved = aiRecordRepository.save(aiRecord);

        // Create pregnancy diagnosis linked to this AI record
        PregnancyDiagnosis pd = new PregnancyDiagnosis();
        pd.setAiRecord(saved);
        pd.setAiDate(saved.getAiDate());
        // Set default PD status (id=3)
        PdStatus defaultPdStatus = new PdStatus();
        defaultPdStatus.setId(3);
        pd.setPdStatus(defaultPdStatus);
        pregnancyDiagnosisRepository.save(pd);

        // Deduct 1 straw from non-bull semen only
        if (semen.getBull() == null || !semen.getBull()) {
            semenService.deductStraw(semenId);
        }

        return saved;
    }
}
