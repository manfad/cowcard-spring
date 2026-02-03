package cowcard.server.PdStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/pd-status")
public class PdStatusController {

    @Autowired
    private PdStatusService pdStatusService;

    @GetMapping("/all")
    public ServerRes<List<PdStatus>> getAll() {
        return ServerRes.success(pdStatusService.findAll());
    }
}
