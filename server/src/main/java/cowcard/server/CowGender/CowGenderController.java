package cowcard.server.CowGender;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/cow-gender")
public class CowGenderController {

    @Autowired
    private CowGenderService cowGenderService;

    @GetMapping("/all")
    public ServerRes<List<CowGender>> getAll() {
        return ServerRes.success(cowGenderService.findAll());
    }
}
