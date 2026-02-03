package cowcard.server.Color;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;

@RestController
@RequestMapping("/color")
public class ColorController {

    @Autowired
    private ColorService colorService;

    @GetMapping("/all")
    public ServerRes<List<Color>> getAll() {
        return ServerRes.success(colorService.findAll());
    }
}
