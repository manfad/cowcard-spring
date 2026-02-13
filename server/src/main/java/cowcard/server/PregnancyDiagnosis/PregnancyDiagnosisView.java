package cowcard.server.PregnancyDiagnosis;

public record PregnancyDiagnosisView(
        Integer id,
        String aiDate,
        String pregnantDate,
        String aiRecordCode,
        Integer aiRecordId,
        Integer damId,
        String damTag,
        Integer semenId,
        String semenName,
        String diagnosisBy,
        Integer pdStatusId,
        String pdStatusName,
        String pdStatusColor) {

    public static PregnancyDiagnosisView from(PregnancyDiagnosis pd) {
        var ai = pd.getAiRecord();
        return new PregnancyDiagnosisView(
                pd.getId(),
                pd.getAiDate(),
                pd.getPregnantDate(),
                ai != null ? ai.getCode() : null,
                ai != null ? ai.getId() : null,
                ai != null && ai.getDam() != null ? ai.getDam().getId() : null,
                ai != null && ai.getDam() != null ? ai.getDam().getTag() : null,
                ai != null && ai.getSemen() != null ? ai.getSemen().getId() : null,
                ai != null && ai.getSemen() != null ? ai.getSemen().getName() : null,
                pd.getDiagnosisBy() != null ? pd.getDiagnosisBy().getName() : null,
                pd.getPdStatus() != null ? pd.getPdStatus().getId() : null,
                pd.getPdStatus() != null ? pd.getPdStatus().getName() : null,
                pd.getPdStatus() != null ? pd.getPdStatus().getColor() : null);
    }
}
