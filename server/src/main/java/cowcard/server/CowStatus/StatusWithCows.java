package cowcard.server.CowStatus;

import java.util.List;

public record StatusWithCows(Integer id, String name, String remark, Boolean active, List<StatusCowSummary> cows) {
    public static StatusWithCows from(CowStatus status, List<StatusCowSummary> cows) {
        return new StatusWithCows(status.getId(), status.getName(), status.getRemark(), status.getActive(), cows);
    }
}
