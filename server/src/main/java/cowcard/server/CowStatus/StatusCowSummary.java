package cowcard.server.CowStatus;

import cowcard.server.Cow.Cow;

public record StatusCowSummary(Integer id, String tag, String role, String feedlot) {
    public static StatusCowSummary from(Cow cow) {
        return new StatusCowSummary(
                cow.getId(),
                cow.getTag(),
                cow.getRole() != null ? cow.getRole().getName() : null,
                cow.getCurrentFeedlot() != null ? cow.getCurrentFeedlot().getName() : null);
    }
}
