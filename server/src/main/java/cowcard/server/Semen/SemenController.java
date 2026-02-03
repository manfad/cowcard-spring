package cowcard.server.Semen;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/semen")
public class SemenController {

    @Autowired
    private SemenService semenService;

    @GetMapping("/all")
    public ServerRes<List<Semen>> getAll() {
        return ServerRes.success(semenService.findAll());
    }
}
