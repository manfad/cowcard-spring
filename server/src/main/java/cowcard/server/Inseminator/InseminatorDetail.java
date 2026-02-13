package cowcard.server.Inseminator;

import java.util.List;

public record InseminatorDetail(
        Integer id, String name, String remark, Boolean active,
        List<AiRecordSummaryByInseminator> aiByRecords,
        List<AiRecordSummaryByInseminator> preparedByRecords,
        List<PdSummary> diagnosisByRecords) {

    public static InseminatorDetail from(
            Inseminator ins,
            List<AiRecordSummaryByInseminator> aiBy,
            List<AiRecordSummaryByInseminator> preparedBy,
            List<PdSummary> diagnosisBy) {
        return new InseminatorDetail(
                ins.getId(), ins.getName(), ins.getRemark(), ins.getActive(),
                aiBy, preparedBy, diagnosisBy);
    }
}
