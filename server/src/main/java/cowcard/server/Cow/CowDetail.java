package cowcard.server.Cow;

import java.util.List;

public record CowDetail(
        Integer id,
        String tag,
        String dob,
        Double weight,
        String remark,
        String gender,
        String color,
        String role,
        String status,
        String feedlot,
        String transponder,
        String damTag,
        String semenName,
        List<CowTransponderHistoryItem> transponderHistory,
        List<CowFeedlotHistoryItem> feedlotHistory,
        List<CowAiRecordItem> aiRecords,
        List<CowCalfItem> calves) {

    public static CowDetail from(Cow cow,
                                  List<CowTransponderHistoryItem> transponderHistory,
                                  List<CowFeedlotHistoryItem> feedlotHistory,
                                  List<CowAiRecordItem> aiRecords,
                                  List<CowCalfItem> calves) {
        return new CowDetail(
                cow.getId(),
                cow.getTag(),
                cow.getDob() != null ? cow.getDob().toString() : null,
                cow.getWeight() != null ? cow.getWeight().doubleValue() : null,
                cow.getRemark(),
                cow.getGender() != null ? cow.getGender().getName() : null,
                cow.getColor() != null ? cow.getColor().getName() : null,
                cow.getRole() != null ? cow.getRole().getName() : null,
                cow.getStatus() != null ? cow.getStatus().getName() : null,
                cow.getCurrentFeedlot() != null ? cow.getCurrentFeedlot().getName() : null,
                cow.getCurrentTransponder() != null ? cow.getCurrentTransponder().getCode() : null,
                cow.getDam() != null ? cow.getDam().getTag() : null,
                cow.getSemen() != null ? cow.getSemen().getName() : null,
                transponderHistory,
                feedlotHistory,
                aiRecords,
                calves);
    }
}
