package cowcard.server.CalfStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/calf-status")
public class CalfStatusController {

    @Autowired
    private CalfStatusService calfStatusService;

    @GetMapping("/all")
    public ServerRes<List<CalfStatus>> getAll() {
        return ServerRes.success(calfStatusService.findAll());
    }
}
