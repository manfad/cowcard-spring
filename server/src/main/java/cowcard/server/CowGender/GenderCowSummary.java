package cowcard.server.CowGender;

import cowcard.server.Cow.Cow;

public record GenderCowSummary(Integer id, String tag, String role, String feedlot) {
    public static GenderCowSummary from(Cow cow) {
        return new GenderCowSummary(
                cow.getId(),
                cow.getTag(),
                cow.getRole() != null ? cow.getRole().getName() : null,
                cow.getCurrentFeedlot() != null ? cow.getCurrentFeedlot().getName() : null);
    }
}
