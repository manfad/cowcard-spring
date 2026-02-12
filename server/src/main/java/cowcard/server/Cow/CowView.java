package cowcard.server.Cow;

import java.math.BigDecimal;

public record CowView(
        Integer id,
        String tag,
        String gender,
        String role,
        String status,
        BigDecimal weight,
        String feedlot,
        String transponder,
        String remark,
        Boolean active) {

    public static CowView from(Cow cow) {
        return new CowView(
                cow.getId(),
                cow.getTag(),
                cow.getGender() != null ? cow.getGender().getName() : null,
                cow.getRole() != null ? cow.getRole().getName() : null,
                cow.getStatus() != null ? cow.getStatus().getName() : null,
                cow.getWeight(),
                cow.getCurrentFeedlot() != null ? cow.getCurrentFeedlot().getName() : null,
                cow.getCurrentTransponder() != null ? cow.getCurrentTransponder().getCode() : null,
                cow.getRemark(),
                cow.getActive());
    }
}
