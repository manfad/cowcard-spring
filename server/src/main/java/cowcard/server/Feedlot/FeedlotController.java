package cowcard.server.Feedlot;

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
@RequestMapping("/feedlot")
public class FeedlotController {

    @Autowired
    private FeedlotService feedlotService;

    @GetMapping("/all")
    public ServerRes<List<Feedlot>> getAll() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetail ud && ud.isAdmin()) {
            return ServerRes.success(feedlotService.findAll());
        }
        return ServerRes.success(feedlotService.findAllActive());
    }

    @PutMapping("/toggle-active/{id}")
    public ServerRes<Feedlot> toggleActive(@PathVariable Integer id) {
        return ServerRes.success(feedlotService.toggleActive(id));
    }

    @PostMapping
    public ServerRes<Feedlot> create(@RequestBody Feedlot feedlot) {
        return ServerRes.success(feedlotService.create(feedlot));
    }

    @PutMapping("/{id}")
    public ServerRes<Feedlot> update(@PathVariable Integer id, @RequestBody Feedlot feedlot) {
        return ServerRes.success(feedlotService.update(id, feedlot));
    }

    @PutMapping("/assign/{feedlotId}/{cowId}")
    public ServerRes<Feedlot> assign(@PathVariable Integer feedlotId, @PathVariable Integer cowId) {
        return feedlotService.assign(feedlotId, cowId);
    }

    @PutMapping("/unassign/{cowId}")
    public ServerRes<Feedlot> unassign(@PathVariable Integer cowId) {
        return feedlotService.unassign(cowId);
    }

    @GetMapping("/{id}/with-cows")
    public ServerRes<FeedlotWithCows> getWithCows(@PathVariable Integer id) {
        return feedlotService.getWithCows(id);
    }

    @PutMapping("/assign-bulk/{feedlotId}")
    public ServerRes<FeedlotWithCows> assignBulk(@PathVariable Integer feedlotId,
            @RequestBody List<Integer> cowIds) {
        return feedlotService.assignBulk(feedlotId, cowIds);
    }

    @PutMapping("/unassign-bulk")
    public ServerRes<Void> unassignBulk(@RequestBody List<Integer> cowIds) {
        return feedlotService.unassignBulk(cowIds);
    }
}
