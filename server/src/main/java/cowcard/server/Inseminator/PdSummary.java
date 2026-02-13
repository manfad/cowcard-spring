package cowcard.server.Inseminator;

import cowcard.server.PregnancyDiagnosis.PregnancyDiagnosis;

public record PdSummary(Integer id, String aiDate, String aiRecordCode, String pdStatus) {
    public static PdSummary from(PregnancyDiagnosis pd) {
        return new PdSummary(
                pd.getId(),
                pd.getAiDate(),
                pd.getAiRecord() != null ? pd.getAiRecord().getCode() : null,
                pd.getPdStatus() != null ? pd.getPdStatus().getName() : null);
    }
}
