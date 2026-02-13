package cowcard.server.AiRecord;

public record BullAiSummary(Integer id, String code) {

    public static BullAiSummary from(AiRecord record) {
        return new BullAiSummary(record.getId(), record.getCode());
    }
}
