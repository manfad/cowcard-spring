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

    @PutMapping("/toggle-active/{id}")
    public ServerRes<CowStatus> toggleActive(@PathVariable Integer id) {
        return ServerRes.success(cowStatusService.toggleActive(id));
    }

    @PostMapping
    public ServerRes<CowStatus> create(@RequestBody CowStatus cowStatus) {
        return ServerRes.success(cowStatusService.create(cowStatus));
    }

    @PutMapping("/{id}")
    public ServerRes<CowStatus> update(@PathVariable Integer id, @RequestBody CowStatus cowStatus) {
        return ServerRes.success(cowStatusService.update(id, cowStatus));
    }
}
