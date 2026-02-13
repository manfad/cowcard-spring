package cowcard.server.AiRecord;

import java.util.List;

public record DamAiRecord(
        Integer damId,
        String damTag,
        List<AiRecordSummary> aiRecords,
        List<BullAiSummary> bullAiRecords,
        Integer lastAiDays) {
}
