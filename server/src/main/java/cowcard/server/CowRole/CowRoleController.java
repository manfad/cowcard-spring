package cowcard.server.CowRole;

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
@RequestMapping("/cow-role")
public class CowRoleController {

    @Autowired
    private CowRoleService cowRoleService;

    @GetMapping("/all")
    public ServerRes<List<CowRole>> getAll() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetail ud && ud.isAdmin()) {
            return ServerRes.success(cowRoleService.findAll());
        }
        return ServerRes.success(cowRoleService.findAllActive());
    }

    @PutMapping("/toggle-active/{id}")
    public ServerRes<CowRole> toggleActive(@PathVariable Integer id) {
        return ServerRes.success(cowRoleService.toggleActive(id));
    }

    @PostMapping
    public ServerRes<CowRole> create(@RequestBody CowRoleRequest request) {
        CowRole cowRole = new CowRole();
        cowRole.setName(request.name());
        cowRole.setRemark(request.remark());
        return ServerRes.success(cowRoleService.create(cowRole, request.cowGenderIds()));
    }

    @PutMapping("/{id}")
    public ServerRes<CowRole> update(@PathVariable Integer id, @RequestBody CowRoleRequest request) {
        CowRole cowRole = new CowRole();
        cowRole.setName(request.name());
        cowRole.setRemark(request.remark());
        return ServerRes.success(cowRoleService.update(id, cowRole, request.cowGenderIds()));
    }

    public record CowRoleRequest(String name, String remark, List<Integer> cowGenderIds) {}
}
