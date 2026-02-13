package cowcard.server.Color;

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
@RequestMapping("/color")
public class ColorController {

    @Autowired
    private ColorService colorService;

    @GetMapping("/all")
    public ServerRes<List<Color>> getAll() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetail ud && ud.isAdmin()) {
            return ServerRes.success(colorService.findAll());
        }
        return ServerRes.success(colorService.findAllActive());
    }

    @GetMapping("/{id}/detail")
    public ServerRes<ColorWithCows> getWithCows(@PathVariable Integer id) {
        return ServerRes.success(colorService.getWithCows(id));
    }

    @PutMapping("/toggle-active/{id}")
    public ServerRes<Color> toggleActive(@PathVariable Integer id) {
        return ServerRes.success(colorService.toggleActive(id));
    }

    @PostMapping
    public ServerRes<Color> create(@RequestBody Color color) {
        return ServerRes.success(colorService.create(color));
    }

    @PutMapping("/{id}")
    public ServerRes<Color> update(@PathVariable Integer id, @RequestBody Color color) {
        return ServerRes.success(colorService.update(id, color));
    }
}
