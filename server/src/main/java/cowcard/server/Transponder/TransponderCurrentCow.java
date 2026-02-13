package cowcard.server.Transponder;

import cowcard.server.Cow.Cow;

public record TransponderCurrentCow(Integer id, String tag) {
    public static TransponderCurrentCow from(Cow cow) {
        return new TransponderCurrentCow(cow.getId(), cow.getTag());
    }
}
