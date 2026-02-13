package cowcard.server.CowGender;

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
@RequestMapping("/cow-gender")
public class CowGenderController {

    @Autowired
    private CowGenderService cowGenderService;

    @GetMapping("/all")
    public ServerRes<List<CowGender>> getAll() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetail ud && ud.isAdmin()) {
            return ServerRes.success(cowGenderService.findAll());
        }
        return ServerRes.success(cowGenderService.findAllActive());
    }

    @GetMapping("/{id}/detail")
    public ServerRes<GenderWithCows> getWithCows(@PathVariable Integer id) {
        return ServerRes.success(cowGenderService.getWithCows(id));
    }

    @PutMapping("/toggle-active/{id}")
    public ServerRes<CowGender> toggleActive(@PathVariable Integer id) {
        return ServerRes.success(cowGenderService.toggleActive(id));
    }

    @PostMapping
    public ServerRes<CowGender> create(@RequestBody CowGender cowGender) {
        return ServerRes.success(cowGenderService.create(cowGender));
    }

    @PutMapping("/{id}")
    public ServerRes<CowGender> update(@PathVariable Integer id, @RequestBody CowGender cowGender) {
        return ServerRes.success(cowGenderService.update(id, cowGender));
    }
}
