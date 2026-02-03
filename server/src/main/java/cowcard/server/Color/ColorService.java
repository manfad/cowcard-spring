package cowcard.server.Color;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ColorService {

    @Autowired
    private ColorRepository colorRepository;

    public List<Color> findAll() {
        return colorRepository.findAll();
    }
}
