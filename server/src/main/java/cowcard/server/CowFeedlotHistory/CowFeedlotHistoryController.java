package cowcard.server.CowFeedlotHistory;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/cow-feedlot-history")
public class CowFeedlotHistoryController {

    @Autowired
    private CowFeedlotHistoryService cowFeedlotHistoryService;

    @GetMapping("/all")
    public ServerRes<List<CowFeedlotHistory>> getAll() {
        return ServerRes.success(cowFeedlotHistoryService.findAll());
    }
}
