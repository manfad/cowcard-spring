package cowcard.server.CowTransponderHistory;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/cow-transponder-history")
public class CowTransponderHistoryController {

    @Autowired
    private CowTransponderHistoryService cowTransponderHistoryService;

    @GetMapping("/all")
    public ServerRes<List<CowTransponderHistory>> getAll() {
        return ServerRes.success(cowTransponderHistoryService.findAll());
    }
}
