package cowcard.server.CowGender;

import java.util.List;

public record GenderWithCows(Integer id, String name, String remark, Boolean active, List<GenderCowSummary> cows) {
    public static GenderWithCows from(CowGender gender, List<GenderCowSummary> cows) {
        return new GenderWithCows(gender.getId(), gender.getName(), gender.getRemark(), gender.getActive(), cows);
    }
}
