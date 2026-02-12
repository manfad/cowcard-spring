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

    public List<Color> findAllActive() {
        return colorRepository.findByActiveTrue();
    }

    public Color toggleActive(Integer id) {
        Color e = colorRepository.findById(id).orElseThrow();
        e.setActive(e.getActive() == null || !e.getActive());
        return colorRepository.save(e);
    }

    public Color create(Color color) {
        color.setActive(true);
        return colorRepository.save(color);
    }

    public Color update(Integer id, Color color) {
        Color e = colorRepository.findById(id).orElseThrow();
        e.setName(color.getName());
        e.setRemark(color.getRemark());
        return colorRepository.save(e);
    }
}
