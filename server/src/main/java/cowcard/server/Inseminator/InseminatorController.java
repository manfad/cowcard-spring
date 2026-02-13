package cowcard.server.Inseminator;

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
@RequestMapping("/inseminator")
public class InseminatorController {

    @Autowired
    private InseminatorService inseminatorService;

    @GetMapping("/all")
    public ServerRes<List<Inseminator>> getAll() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetail ud && ud.isAdmin()) {
            return ServerRes.success(inseminatorService.findAll());
        }
        return ServerRes.success(inseminatorService.findAllActive());
    }

    @GetMapping("/{id}/detail")
    public ServerRes<InseminatorDetail> getDetail(@PathVariable Integer id) {
        return ServerRes.success(inseminatorService.getDetail(id));
    }

    @PutMapping("/toggle-active/{id}")
    public ServerRes<Inseminator> toggleActive(@PathVariable Integer id) {
        return ServerRes.success(inseminatorService.toggleActive(id));
    }

    @PostMapping
    public ServerRes<Inseminator> create(@RequestBody Inseminator inseminator) {
        return ServerRes.success(inseminatorService.create(inseminator));
    }

    @PutMapping("/{id}")
    public ServerRes<Inseminator> update(@PathVariable Integer id, @RequestBody Inseminator inseminator) {
        return ServerRes.success(inseminatorService.update(id, inseminator));
    }
}
