package cowcard.server.Semen;

import java.util.List;

public record SemenDetail(
        Integer id,
        String name,
        String sire,
        String date,
        Integer straw,
        Boolean bull,
        String remark,
        List<SemenAiRecordItem> aiRecords,
        List<SemenCowItem> cows) {

    public static SemenDetail from(Semen semen,
                                    List<SemenAiRecordItem> aiRecords,
                                    List<SemenCowItem> cows) {
        return new SemenDetail(
                semen.getId(),
                semen.getName(),
                semen.getSire(),
                semen.getDate() != null ? semen.getDate().toString() : null,
                semen.getStraw(),
                semen.getBull(),
                semen.getRemark(),
                aiRecords,
                cows);
    }
}
