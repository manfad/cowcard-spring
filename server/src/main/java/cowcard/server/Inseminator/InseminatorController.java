package cowcard.server.Inseminator;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/inseminator")
public class InseminatorController {

    @Autowired
    private InseminatorService inseminatorService;

    @GetMapping("/all")
    public ServerRes<List<Inseminator>> getAll() {
        return ServerRes.success(inseminatorService.findAll());
    }
}
