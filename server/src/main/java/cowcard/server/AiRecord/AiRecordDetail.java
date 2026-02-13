package cowcard.server.AiRecord;

public record AiRecordDetail(
        Integer id,
        String code,
        String aiDate,
        String aiTime,
        String remark,
        String feedlot,
        String damTag,
        Integer damId,
        String semenName,
        Integer semenId,
        String aiBy,
        String preparedBy,
        String status,
        PregnancyDiagnosisItem pregnancyDiagnosis,
        CalfRecordItem calfRecord) {

    public static AiRecordDetail from(AiRecord r,
                                       PregnancyDiagnosisItem pregnancyDiagnosis,
                                       CalfRecordItem calfRecord) {
        return new AiRecordDetail(
                r.getId(),
                r.getCode(),
                r.getAiDate(),
                r.getAiTime(),
                r.getRemark(),
                r.getFeedlot(),
                r.getDam() != null ? r.getDam().getTag() : null,
                r.getDam() != null ? r.getDam().getId() : null,
                r.getSemen() != null ? r.getSemen().getName() : null,
                r.getSemen() != null ? r.getSemen().getId() : null,
                r.getAiBy() != null ? r.getAiBy().getName() : null,
                r.getPreparedBy() != null ? r.getPreparedBy().getName() : null,
                r.getStatus() != null ? r.getStatus().getName() : null,
                pregnancyDiagnosis,
                calfRecord);
    }
}
