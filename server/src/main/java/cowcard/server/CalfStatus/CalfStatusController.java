package cowcard.server.CalfStatus;

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
@RequestMapping("/calf-status")
public class CalfStatusController {

    @Autowired
    private CalfStatusService calfStatusService;

    @GetMapping("/all")
    public ServerRes<List<CalfStatus>> getAll() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetail ud && ud.isAdmin()) {
            return ServerRes.success(calfStatusService.findAll());
        }
        return ServerRes.success(calfStatusService.findAllActive());
    }

    @PutMapping("/toggle-active/{id}")
    public ServerRes<CalfStatus> toggleActive(@PathVariable Integer id) {
        return ServerRes.success(calfStatusService.toggleActive(id));
    }

    @PostMapping
    public ServerRes<CalfStatus> create(@RequestBody CalfStatus calfStatus) {
        return ServerRes.success(calfStatusService.create(calfStatus));
    }

    @PutMapping("/{id}")
    public ServerRes<CalfStatus> update(@PathVariable Integer id, @RequestBody CalfStatus calfStatus) {
        return ServerRes.success(calfStatusService.update(id, calfStatus));
    }
}
