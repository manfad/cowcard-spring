package cowcard.server.CowRole;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/cow-role")
public class CowRoleController {

    @Autowired
    private CowRoleService cowRoleService;

    @GetMapping("/all")
    public ServerRes<List<CowRole>> getAll() {
        return ServerRes.success(cowRoleService.findAll());
    }
}
