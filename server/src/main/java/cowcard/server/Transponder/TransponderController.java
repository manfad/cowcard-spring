package cowcard.server.Transponder;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/transponder")
public class TransponderController {

    @Autowired
    private TransponderService transponderService;

    @GetMapping("/{id}/detail")
    public ServerRes<TransponderDetail> getDetail(@PathVariable Integer id) {
        return ServerRes.success(transponderService.getDetail(id));
    }

    @GetMapping("/all")
    public ServerRes<List<Transponder>> getAll() {
        return ServerRes.success(transponderService.findAll());
    }

    @GetMapping("/available")
    public ServerRes<List<Transponder>> getAvailable() {
        return ServerRes.success(transponderService.findAvailable());
    }

    @PostMapping
    public ServerRes<Transponder> create(@RequestBody Transponder transponder) {
        return ServerRes.success(transponderService.create(transponder));
    }

    @PutMapping("/{id}")
    public ServerRes<Transponder> update(@PathVariable Integer id, @RequestBody Transponder transponder) {
        return ServerRes.success(transponderService.update(id, transponder));
    }

    @PutMapping("/assign/{transponderId}/{cowId}")
    public ServerRes<Transponder> assign(@PathVariable Integer transponderId, @PathVariable Integer cowId) {
        return transponderService.assign(transponderId, cowId);
    }

    @PutMapping("/unassign/{transponderId}")
    public ServerRes<Transponder> unassign(@PathVariable Integer transponderId) {
        return transponderService.unassign(transponderId);
    }
}
