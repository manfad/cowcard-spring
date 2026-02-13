package cowcard.server.AiRecord;

import cowcard.server.CalfRecord.CalfRecord;

public record CalfRecordItem(
        Integer id,
        String cowTag,
        Integer cowId) {

    public static CalfRecordItem from(CalfRecord cr) {
        return new CalfRecordItem(
                cr.getId(),
                cr.getCow() != null ? cr.getCow().getTag() : null,
                cr.getCow() != null ? cr.getCow().getId() : null);
    }
}
