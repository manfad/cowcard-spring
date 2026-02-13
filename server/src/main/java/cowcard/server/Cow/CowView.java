package cowcard.server.Cow;

import java.math.BigDecimal;

public record CowView(
        Integer id,
        String tag,
        String gender,
        Integer genderId,
        String role,
        Integer roleId,
        String status,
        Integer statusId,
        BigDecimal weight,
        String feedlot,
        Integer feedlotId,
        String transponder,
        Integer transponderId,
        String remark,
        Boolean active) {

    public static CowView from(Cow cow) {
        return new CowView(
                cow.getId(),
                cow.getTag(),
                cow.getGender() != null ? cow.getGender().getName() : null,
                cow.getGender() != null ? cow.getGender().getId() : null,
                cow.getRole() != null ? cow.getRole().getName() : null,
                cow.getRole() != null ? cow.getRole().getId() : null,
                cow.getStatus() != null ? cow.getStatus().getName() : null,
                cow.getStatus() != null ? cow.getStatus().getId() : null,
                cow.getWeight(),
                cow.getCurrentFeedlot() != null ? cow.getCurrentFeedlot().getName() : null,
                cow.getCurrentFeedlot() != null ? cow.getCurrentFeedlot().getId() : null,
                cow.getCurrentTransponder() != null ? cow.getCurrentTransponder().getCode() : null,
                cow.getCurrentTransponder() != null ? cow.getCurrentTransponder().getId() : null,
                cow.getRemark(),
                cow.getActive());
    }
}
