package cowcard.server.AiRecord;

import cowcard.server.PregnancyDiagnosis.PregnancyDiagnosis;

public record PregnancyDiagnosisItem(
        Integer id,
        String aiDate,
        String diagnosisBy,
        String pdStatus) {

    public static PregnancyDiagnosisItem from(PregnancyDiagnosis pd) {
        return new PregnancyDiagnosisItem(
                pd.getId(),
                pd.getAiDate(),
                pd.getDiagnosisBy() != null ? pd.getDiagnosisBy().getName() : null,
                pd.getPdStatus() != null ? pd.getPdStatus().getName() : null);
    }
}
