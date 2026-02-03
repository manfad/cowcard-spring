package cowcard.server.Feedlot;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/feedlot")
public class FeedlotController {

    @Autowired
    private FeedlotService feedlotService;

    @GetMapping("/all")
    public ServerRes<List<Feedlot>> getAll() {
        return ServerRes.success(feedlotService.findAll());
    }
}
