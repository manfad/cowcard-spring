package cowcard.server.SystemSetting;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cowcard.server.PdStatus.PdStatus;
import cowcard.server.PregnancyDiagnosis.PregnancyDiagnosis;
import cowcard.server.PregnancyDiagnosis.PregnancyDiagnosisRepository;

@Service
public class CronService {

    private static final Logger log = LoggerFactory.getLogger(CronService.class);

    @Autowired
    private PregnancyDiagnosisRepository pregnancyDiagnosisRepository;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Scheduled(cron = "0 0 0 * * *") // Midnight daily
    @Transactional
    public void execute() {
        log.info("Cron job started");

        // Read PD day threshold from system setting id=1
        SystemSetting pdDaySetting = systemSettingRepository.findById(1).orElse(null);
        if (pdDaySetting == null || pdDaySetting.getValue() == null) {
            log.warn("System setting id=1 (PD day value) not found, skipping cron");
            return;
        }

        int pdDays;
        try {
            pdDays = Integer.parseInt(pdDaySetting.getValue());
        } catch (NumberFormatException e) {
            log.warn("System setting id=1 value is not a number: {}", pdDaySetting.getValue());
            return;
        }

        int thresholdDays = pdDays - 5;

        // Find all PDs with status NEW (id=7)
        List<PregnancyDiagnosis> newPds = pregnancyDiagnosisRepository.findByPdStatusId(7);
        int updated = 0;

        for (PregnancyDiagnosis pd : newPds) {
            if (pd.getAiDate() == null || pd.getAiDate().isBlank()) {
                continue;
            }
            LocalDate aiDate = LocalDate.parse(pd.getAiDate());
            long daysSince = ChronoUnit.DAYS.between(aiDate, LocalDate.now());

            if (daysSince >= thresholdDays) {
                PdStatus pendingStatus = new PdStatus();
                pendingStatus.setId(1); // Pending
                pd.setPdStatus(pendingStatus);
                pregnancyDiagnosisRepository.save(pd);
                updated++;
            }
        }

        log.info("Cron: {} PD records transitioned from NEW to Pending", updated);

        // Rule 2: Pregnant (id=3) → Late Gestation (id=6) when 30 days before due date
        SystemSetting pregnantDaySetting = systemSettingRepository.findById(2).orElse(null);
        if (pregnantDaySetting == null || pregnantDaySetting.getValue() == null) {
            log.warn("System setting id=2 (pregnant day total) not found, skipping Pregnant→Late Gestation rule");
            return;
        }

        int pregnantDays;
        try {
            pregnantDays = Integer.parseInt(pregnantDaySetting.getValue());
        } catch (NumberFormatException e) {
            log.warn("System setting id=2 value is not a number: {}", pregnantDaySetting.getValue());
            return;
        }

        int gestationThreshold = pregnantDays - 30;

        List<PregnancyDiagnosis> pregnantPds = pregnancyDiagnosisRepository.findByPdStatusId(3);
        int gestationUpdated = 0;

        for (PregnancyDiagnosis pd : pregnantPds) {
            if (pd.getPregnantDate() == null || pd.getPregnantDate().isBlank()) {
                continue;
            }
            LocalDate pregnantDate = LocalDate.parse(pd.getPregnantDate());
            long daysSincePregnant = ChronoUnit.DAYS.between(pregnantDate, LocalDate.now());

            if (daysSincePregnant >= gestationThreshold) {
                PdStatus lateGestationStatus = new PdStatus();
                lateGestationStatus.setId(6); // Late Gestation
                pd.setPdStatus(lateGestationStatus);
                pregnancyDiagnosisRepository.save(pd);
                gestationUpdated++;
            }
        }

        log.info("Cron: {} PD records transitioned from Pregnant to Late Gestation", gestationUpdated);
        log.info("Cron job completed");
    }
}
