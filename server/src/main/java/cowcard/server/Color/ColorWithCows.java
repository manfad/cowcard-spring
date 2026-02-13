package cowcard.server.Color;

import java.util.List;

public record ColorWithCows(
        Integer id,
        String name,
        String remark,
        Boolean active,
        List<CowSummary> cows) {

    public static ColorWithCows from(Color color, List<CowSummary> cows) {
        return new ColorWithCows(color.getId(), color.getName(), color.getRemark(), color.getActive(), cows);
    }
}
