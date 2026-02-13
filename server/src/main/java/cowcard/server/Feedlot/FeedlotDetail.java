package cowcard.server.Feedlot;

import java.util.List;

public record FeedlotDetail(
        Integer id, String name, String remark, Boolean active,
        List<FeedlotCowSummary> cows,
        List<FeedlotHistorySummary> history) {

    public static FeedlotDetail from(Feedlot feedlot, List<FeedlotCowSummary> cows, List<FeedlotHistorySummary> history) {
        return new FeedlotDetail(feedlot.getId(), feedlot.getName(), feedlot.getRemark(), feedlot.getActive(), cows, history);
    }
}
