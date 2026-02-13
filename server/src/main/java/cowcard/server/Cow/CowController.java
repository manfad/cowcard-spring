package cowcard.server.Cow;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;
import cowcard.server.User.UserDetail;

@RestController
@RequestMapping("/cow")
public class CowController {

    @Autowired
    private CowService cowService;

    @GetMapping("/{id}/detail")
    public ServerRes<CowDetail> getDetail(@PathVariable Integer id) {
        return ServerRes.success(cowService.getDetail(id));
    }

    @GetMapping("/all")
    public ServerRes<List<CowView>> getAll() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetail ud && ud.isAdmin()) {
            return ServerRes.success(cowService.findAllView());
        }
        return ServerRes.success(cowService.findAllActiveView());
    }
}
