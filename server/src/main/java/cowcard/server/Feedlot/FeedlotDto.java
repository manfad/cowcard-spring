package cowcard.server.Feedlot;

public record FeedlotDto(Integer id, String name, String remark, Boolean active, long cowCount) {
    public static FeedlotDto from(Feedlot feedlot, long cowCount) {
        return new FeedlotDto(feedlot.getId(), feedlot.getName(), feedlot.getRemark(), feedlot.getActive(), cowCount);
    }
}
