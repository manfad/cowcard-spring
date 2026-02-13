package cowcard.server.Color;

import cowcard.server.Cow.Cow;

public record CowSummary(
        Integer id,
        String tag,
        String gender,
        String role,
        String status) {

    public static CowSummary from(Cow cow) {
        return new CowSummary(
                cow.getId(),
                cow.getTag(),
                cow.getGender() != null ? cow.getGender().getName() : null,
                cow.getRole() != null ? cow.getRole().getName() : null,
                cow.getStatus() != null ? cow.getStatus().getName() : null);
    }
}
