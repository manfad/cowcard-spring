package cowcard.server.CowRole;

import cowcard.server.Cow.Cow;

public record RoleCowSummary(Integer id, String tag, String feedlot) {
    public static RoleCowSummary from(Cow cow) {
        return new RoleCowSummary(
                cow.getId(),
                cow.getTag(),
                cow.getCurrentFeedlot() != null ? cow.getCurrentFeedlot().getName() : null);
    }
}
