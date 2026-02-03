package cowcard.server.AiStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/ai-status")
public class AiStatusController {

    @Autowired
    private AiStatusService aiStatusService;

    @GetMapping("/all")
    public ServerRes<List<AiStatus>> getAll() {
        return ServerRes.success(aiStatusService.findAll());
    }
}
