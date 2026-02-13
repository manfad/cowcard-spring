package cowcard.server.Transponder;

import java.util.List;

public record TransponderDetail(
        Integer id, String code, String remark,
        TransponderCurrentCow currentCow,
        List<TransponderHistorySummary> history) {

    public static TransponderDetail from(Transponder t, TransponderCurrentCow currentCow, List<TransponderHistorySummary> history) {
        return new TransponderDetail(t.getId(), t.getCode(), t.getRemark(), currentCow, history);
    }
}
