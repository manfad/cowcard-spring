package cowcard.server.Semen;

import cowcard.server.AiRecord.AiRecord;

public record SemenAiRecordItem(
        Integer id,
        String code,
        String aiDate,
        String damTag,
        String aiBy) {

    public static SemenAiRecordItem from(AiRecord r) {
        return new SemenAiRecordItem(
                r.getId(),
                r.getCode(),
                r.getAiDate(),
                r.getDam() != null ? r.getDam().getTag() : null,
                r.getAiBy() != null ? r.getAiBy().getName() : null);
    }
}
