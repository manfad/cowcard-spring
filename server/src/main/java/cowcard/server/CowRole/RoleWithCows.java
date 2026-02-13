package cowcard.server.CowRole;

import java.util.List;

public record RoleWithCows(Integer id, String name, String remark, Boolean active, List<RoleCowSummary> cows) {
    public static RoleWithCows from(CowRole role, List<RoleCowSummary> cows) {
        return new RoleWithCows(role.getId(), role.getName(), role.getRemark(), role.getActive(), cows);
    }
}
