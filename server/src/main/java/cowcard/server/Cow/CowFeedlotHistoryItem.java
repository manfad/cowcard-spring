package cowcard.server.Cow;

import cowcard.server.CowFeedlotHistory.CowFeedlotHistory;

public record CowFeedlotHistoryItem(Integer id, String feedlotName, String movedInAt, String movedOutAt) {
    public static CowFeedlotHistoryItem from(CowFeedlotHistory h) {
        return new CowFeedlotHistoryItem(
                h.getId(),
                h.getFeedlot() != null ? h.getFeedlot().getName() : null,
                h.getMovedInAt() != null ? h.getMovedInAt().toString() : null,
                h.getMovedOutAt() != null ? h.getMovedOutAt().toString() : null);
    }
}
