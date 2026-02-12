package cowcard.server.Semen;

import java.util.List;
import java.time.LocalDate;

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
@RequestMapping("/semen")
public class SemenController {

    @Autowired
    private SemenService semenService;

    @GetMapping("/all")
    public ServerRes<List<Semen>> getAll() {
        return ServerRes.success(semenService.findAll());
    }

    @PostMapping
    public ServerRes<Semen> create(@RequestBody SemenRequest request) {
        Semen semen = new Semen();
        semen.setName(request.name());
        semen.setSire(request.sire());
        semen.setDate(request.date());
        semen.setStraw(request.straw());
        semen.setBull(request.bull());
        semen.setRemark(request.remark());
        return ServerRes.success(semenService.create(semen));
    }

    @PutMapping("/{id}")
    public ServerRes<Semen> update(@PathVariable Integer id, @RequestBody SemenRequest request) {
        Semen semen = new Semen();
        semen.setName(request.name());
        semen.setSire(request.sire());
        semen.setDate(request.date());
        semen.setStraw(request.straw());
        semen.setBull(request.bull());
        semen.setRemark(request.remark());
        return ServerRes.success(semenService.update(id, semen));
    }

    @PutMapping("/toggle-bull/{id}")
    public ServerRes<Semen> toggleBull(@PathVariable Integer id) {
        return ServerRes.success(semenService.toggleBull(id));
    }

    public record SemenRequest(String name, String sire, LocalDate date, Integer straw, Boolean bull, String remark) {}
}
