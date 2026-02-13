package cowcard.server.Inseminator;

import cowcard.server.AiRecord.AiRecord;

public record AiRecordSummaryByInseminator(Integer id, String code, String aiDate, String damTag, String semenName) {
    public static AiRecordSummaryByInseminator from(AiRecord r) {
        return new AiRecordSummaryByInseminator(
                r.getId(),
                r.getCode(),
                r.getAiDate(),
                r.getDam() != null ? r.getDam().getTag() : null,
                r.getSemen() != null ? r.getSemen().getName() : null);
    }
}
