package cowcard.server.Transponder;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/transponder")
public class TransponderController {

    @Autowired
    private TransponderService transponderService;

    @GetMapping("/all")
    public ServerRes<List<Transponder>> getAll() {
        return ServerRes.success(transponderService.findAll());
    }
}
