package cowcard.server.PdStatus;

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
@RequestMapping("/pd-status")
public class PdStatusController {

    @Autowired
    private PdStatusService pdStatusService;

    @GetMapping("/all")
    public ServerRes<List<PdStatus>> getAll() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetail ud && ud.isAdmin()) {
            return ServerRes.success(pdStatusService.findAll());
        }
        return ServerRes.success(pdStatusService.findAllActive());
    }

    @PutMapping("/toggle-active/{id}")
    public ServerRes<PdStatus> toggleActive(@PathVariable Integer id) {
        return ServerRes.success(pdStatusService.toggleActive(id));
    }

    @PostMapping
    public ServerRes<PdStatus> create(@RequestBody PdStatus pdStatus) {
        return ServerRes.success(pdStatusService.create(pdStatus));
    }

    @PutMapping("/{id}")
    public ServerRes<PdStatus> update(@PathVariable Integer id, @RequestBody PdStatus pdStatus) {
        return ServerRes.success(pdStatusService.update(id, pdStatus));
    }
}
