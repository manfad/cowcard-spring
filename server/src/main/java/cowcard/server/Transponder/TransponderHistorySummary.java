package cowcard.server.Transponder;

import cowcard.server.CowTransponderHistory.CowTransponderHistory;

public record TransponderHistorySummary(Integer id, String cowTag, String assignedAt, String unassignedAt) {
    public static TransponderHistorySummary from(CowTransponderHistory h) {
        return new TransponderHistorySummary(
                h.getId(),
                h.getCow() != null ? h.getCow().getTag() : null,
                h.getAssignedAt() != null ? h.getAssignedAt().toString() : null,
                h.getUnassignedAt() != null ? h.getUnassignedAt().toString() : null);
    }
}
