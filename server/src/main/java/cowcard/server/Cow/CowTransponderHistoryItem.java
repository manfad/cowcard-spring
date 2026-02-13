package cowcard.server.Cow;

import cowcard.server.CowTransponderHistory.CowTransponderHistory;

public record CowTransponderHistoryItem(Integer id, String transponderCode, String assignedAt, String unassignedAt) {
    public static CowTransponderHistoryItem from(CowTransponderHistory h) {
        return new CowTransponderHistoryItem(
                h.getId(),
                h.getTransponder() != null ? h.getTransponder().getCode() : null,
                h.getAssignedAt() != null ? h.getAssignedAt().toString() : null,
                h.getUnassignedAt() != null ? h.getUnassignedAt().toString() : null);
    }
}
