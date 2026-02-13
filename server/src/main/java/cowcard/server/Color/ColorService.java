package cowcard.server.Color;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cowcard.server.Cow.CowRepository;

@Service
public class ColorService {

    @Autowired
    private ColorRepository colorRepository;

    @Autowired
    private CowRepository cowRepository;

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

    public ColorWithCows getWithCows(Integer id) {
        Color color = colorRepository.findById(id).orElseThrow();
        List<CowSummary> cows = cowRepository.findByColorIdOrderByTag(id).stream()
                .map(CowSummary::from)
                .toList();
        return ColorWithCows.from(color, cows);
    }

    public Color update(Integer id, Color color) {
        Color e = colorRepository.findById(id).orElseThrow();
        e.setName(color.getName());
        e.setRemark(color.getRemark());
        return colorRepository.save(e);
    }
}
