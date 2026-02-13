package cowcard.server.Semen;

import cowcard.server.Cow.Cow;

public record SemenCowItem(
        Integer id,
        String tag,
        String gender,
        String role,
        String feedlot) {

    public static SemenCowItem from(Cow cow) {
        return new SemenCowItem(
                cow.getId(),
                cow.getTag(),
                cow.getGender() != null ? cow.getGender().getName() : null,
                cow.getRole() != null ? cow.getRole().getName() : null,
                cow.getCurrentFeedlot() != null ? cow.getCurrentFeedlot().getName() : null);
    }
}
