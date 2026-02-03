package cowcard.server.CowStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/cow-status")
public class CowStatusController {

    @Autowired
    private CowStatusService cowStatusService;

    @GetMapping("/all")
    public ServerRes<List<CowStatus>> getAll() {
        return ServerRes.success(cowStatusService.findAll());
    }
}
