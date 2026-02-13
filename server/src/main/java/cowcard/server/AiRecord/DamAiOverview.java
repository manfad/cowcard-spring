package cowcard.server.AiRecord;

import java.util.List;

public record DamAiOverview(
        Integer damId,
        String damTag,
        List<AiRecordSummary> aiRecords) {
}
