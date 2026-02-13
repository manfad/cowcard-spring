package cowcard.server.Feedlot;

import cowcard.server.Cow.Cow;

public record FeedlotCowSummary(Integer id, String tag, String role) {
    public static FeedlotCowSummary from(Cow cow) {
        return new FeedlotCowSummary(
                cow.getId(),
                cow.getTag(),
                cow.getRole() != null ? cow.getRole().getName() : null);
    }
}
