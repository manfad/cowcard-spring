package cowcard.server.TransponderRecord;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/transponder-record")
public class TransponderRecordController {

    @Autowired
    private TransponderRecordService transponderRecordService;

    @GetMapping("/all")
    public ServerRes<List<TransponderRecord>> getAll() {
        return ServerRes.success(transponderRecordService.findAll());
    }
}
