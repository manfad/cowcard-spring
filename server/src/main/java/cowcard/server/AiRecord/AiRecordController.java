package cowcard.server.AiRecord;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/ai-record")
public class AiRecordController {

    @Autowired
    private AiRecordService aiRecordService;

    @GetMapping("/all")
    public ServerRes<List<AiRecord>> getAll() {
        return ServerRes.success(aiRecordService.findAll());
    }
}
