package cowcard.server.Cow;

public record CowCalfItem(Integer id, String tag, String dob, String gender, String color) {
    public static CowCalfItem from(Cow cow) {
        return new CowCalfItem(
                cow.getId(),
                cow.getTag(),
                cow.getDob() != null ? cow.getDob().toString() : null,
                cow.getGender() != null ? cow.getGender().getName() : null,
                cow.getColor() != null ? cow.getColor().getName() : null);
    }
}
