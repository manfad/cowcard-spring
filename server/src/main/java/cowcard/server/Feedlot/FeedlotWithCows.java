package cowcard.server.Feedlot;

import java.util.List;

import cowcard.server.Cow.CowView;

public record FeedlotWithCows(
        Integer id,
        String name,
        String remark,
        Boolean active,
        List<CowView> cows) {

    public static FeedlotWithCows from(Feedlot feedlot, List<CowView> cows) {
        return new FeedlotWithCows(
                feedlot.getId(),
                feedlot.getName(),
                feedlot.getRemark(),
                feedlot.getActive(),
                cows);
    }
}
