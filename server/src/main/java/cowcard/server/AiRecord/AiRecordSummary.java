package cowcard.server.AiRecord;

public record AiRecordSummary(
        Integer id,
        String code,
        String aiDate,
        String semenName) {

    public static AiRecordSummary from(AiRecord record) {
        return new AiRecordSummary(
                record.getId(),
                record.getCode(),
                record.getAiDate(),
                record.getSemen() != null ? record.getSemen().getName() : null);
    }
}
