package cowcard.server.Cow;

import cowcard.server.AiRecord.AiRecord;

public record CowAiRecordItem(Integer id, String code, String aiDate, String aiTime, String semenName,
                               String aiBy, String preparedBy, String feedlot, String status) {
    public static CowAiRecordItem from(AiRecord r) {
        return new CowAiRecordItem(
                r.getId(),
                r.getCode(),
                r.getAiDate(),
                r.getAiTime(),
                r.getSemen() != null ? r.getSemen().getName() : null,
                r.getAiBy() != null ? r.getAiBy().getName() : null,
                r.getPreparedBy() != null ? r.getPreparedBy().getName() : null,
                r.getFeedlot(),
                r.getStatus() != null ? r.getStatus().getName() : null);
    }
}
