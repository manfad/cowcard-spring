package cowcard.server.CowStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;
import cowcard.server.User.UserDetail;

@RestController
@RequestMapping("/cow-status")
public class CowStatusController {

    @Autowired
    private CowStatusService cowStatusService;

    @GetMapping("/all")
    public ServerRes<List<CowStatus>> getAll() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetail ud && ud.isAdmin()) {
            return ServerRes.success(cowStatusService.findAll());
        }
        return ServerRes.success(cowStatusService.findAllActive());
    }

    @GetMapping("/{id}/detail")
    public ServerRes<StatusWithCows> getWithCows(@PathVariable Integer id) {
        return ServerRes.success(cowStatusService.getWithCows(id));
    }

    @PutMapping("/toggle-active/{id}")
    public ServerRes<CowStatus> toggleActive(@PathVariable Integer id) {
        return ServerRes.success(cowStatusService.toggleActive(id));
    }

    @PostMapping
    public ServerRes<CowStatus> create(@RequestBody CowStatusRequest request) {
        CowStatus cowStatus = new CowStatus();
        cowStatus.setName(request.name());
        cowStatus.setRemark(request.remark());
        return ServerRes.success(cowStatusService.create(cowStatus, request.cowRoleIds()));
    }

    @PutMapping("/{id}")
    public ServerRes<CowStatus> update(@PathVariable Integer id, @RequestBody CowStatusRequest request) {
        CowStatus cowStatus = new CowStatus();
        cowStatus.setName(request.name());
        cowStatus.setRemark(request.remark());
        return ServerRes.success(cowStatusService.update(id, cowStatus, request.cowRoleIds()));
    }

    public record CowStatusRequest(String name, String remark, List<Integer> cowRoleIds) {}
}
