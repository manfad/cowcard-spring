package cowcard.server.PregnancyDiagnosis;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cowcard.server.AiRecord.AiRecord;
import cowcard.server.CalfRecord.CalfRecord;
import cowcard.server.CalfRecord.CalfRecordRepository;
import cowcard.server.Color.Color;
import cowcard.server.Cow.Cow;
import cowcard.server.Cow.CowRepository;
import cowcard.server.CowGender.CowGender;
import cowcard.server.CowStatus.CowStatus;
import cowcard.server.Feedlot.Feedlot;
import cowcard.server.Inseminator.Inseminator;
import cowcard.server.PdStatus.PdStatus;

@Service
public class PregnancyDiagnosisService {

    @Autowired
    private PregnancyDiagnosisRepository pregnancyDiagnosisRepository;

    @Autowired
    private CowRepository cowRepository;

    @Autowired
    private CalfRecordRepository calfRecordRepository;

    public List<PregnancyDiagnosisView> findAll() {
        return pregnancyDiagnosisRepository.findAllOrderByAiRecordAiDateDescIdDesc()
                .stream().map(PregnancyDiagnosisView::from).toList();
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

    @Transactional
    public void registerCalf(Integer pdId, String tag, Integer genderId, String dob,
                             BigDecimal weight, Integer colorId, Integer feedlotId, String remark) {
        PregnancyDiagnosis pd = pregnancyDiagnosisRepository.findById(pdId).orElseThrow();
        AiRecord aiRecord = pd.getAiRecord();

        // Create the calf cow
        Cow calf = new Cow();
        calf.setTag(tag);
        calf.setActive(true);

        CowGender gender = new CowGender();
        gender.setId(genderId);
        calf.setGender(gender);

        if (dob != null) {
            calf.setDob(LocalDate.parse(dob));
        }
        if (weight != null) {
            calf.setWeight(weight);
        }
        if (colorId != null) {
            Color color = new Color();
            color.setId(colorId);
            calf.setColor(color);
        }
        if (feedlotId != null) {
            Feedlot feedlot = new Feedlot();
            feedlot.setId(feedlotId);
            calf.setCurrentFeedlot(feedlot);
        }
        calf.setRemark(remark);

        // Set dam and semen from the AI record
        calf.setDam(aiRecord.getDam());
        calf.setSemen(aiRecord.getSemen());

        // Set status to New Born (id=4)
        CowStatus newBornStatus = new CowStatus();
        newBornStatus.setId(4);
        calf.setStatus(newBornStatus);

        Cow savedCalf = cowRepository.save(calf);

        // Create calf record linking cow, AI record, and PD
        CalfRecord calfRecord = new CalfRecord();
        calfRecord.setCow(savedCalf);
        calfRecord.setAiRecord(aiRecord);
        calfRecord.setPregnancyDiagnosis(pd);
        calfRecordRepository.save(calfRecord);
    }
}
