package cowcard.server.Feedlot;

import cowcard.server.CowFeedlotHistory.CowFeedlotHistory;

public record FeedlotHistorySummary(Integer id, String cowTag, String movedInAt, String movedOutAt) {
    public static FeedlotHistorySummary from(CowFeedlotHistory h) {
        return new FeedlotHistorySummary(
                h.getId(),
                h.getCow() != null ? h.getCow().getTag() : null,
                h.getMovedInAt() != null ? h.getMovedInAt().toString() : null,
                h.getMovedOutAt() != null ? h.getMovedOutAt().toString() : null);
    }
}
