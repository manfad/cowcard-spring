package cowcard.server.AiStatus;

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
@RequestMapping("/ai-status")
public class AiStatusController {

    @Autowired
    private AiStatusService aiStatusService;

    @GetMapping("/all")
    public ServerRes<List<AiStatus>> getAll() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetail ud && ud.isAdmin()) {
            return ServerRes.success(aiStatusService.findAll());
        }
        return ServerRes.success(aiStatusService.findAllActive());
    }

    @PutMapping("/toggle-active/{id}")
    public ServerRes<AiStatus> toggleActive(@PathVariable Integer id) {
        return ServerRes.success(aiStatusService.toggleActive(id));
    }

    @PostMapping
    public ServerRes<AiStatus> create(@RequestBody AiStatus aiStatus) {
        return ServerRes.success(aiStatusService.create(aiStatus));
    }

    @PutMapping("/{id}")
    public ServerRes<AiStatus> update(@PathVariable Integer id, @RequestBody AiStatus aiStatus) {
        return ServerRes.success(aiStatusService.update(id, aiStatus));
    }
}
