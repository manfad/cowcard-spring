package cowcard.server.CalfRecord;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/calf-record")
public class CalfRecordController {

    @Autowired
    private CalfRecordService calfRecordService;

    @GetMapping("/all")
    public ServerRes<List<CalfRecord>> getAll() {
        return ServerRes.success(calfRecordService.findAll());
    }
}
