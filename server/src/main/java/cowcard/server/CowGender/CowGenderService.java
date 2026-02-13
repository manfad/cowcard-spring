package cowcard.server.CowGender;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cowcard.server.Cow.CowRepository;

@Service
public class CowGenderService {

    @Autowired
    private CowGenderRepository cowGenderRepository;

    @Autowired
    private CowRepository cowRepository;

    public List<CowGender> findAll() {
        return cowGenderRepository.findAll();
    }

    public List<CowGender> findAllActive() {
        return cowGenderRepository.findByActiveTrue();
    }

    public CowGender toggleActive(Integer id) {
        CowGender e = cowGenderRepository.findById(id).orElseThrow();
        e.setActive(e.getActive() == null || !e.getActive());
        return cowGenderRepository.save(e);
    }

    public CowGender create(CowGender cowGender) {
        cowGender.setActive(true);
        return cowGenderRepository.save(cowGender);
    }

    public GenderWithCows getWithCows(Integer id) {
        CowGender gender = cowGenderRepository.findById(id).orElseThrow();
        List<GenderCowSummary> cows = cowRepository.findByGenderIdOrderByTag(id).stream()
                .map(GenderCowSummary::from).toList();
        return GenderWithCows.from(gender, cows);
    }

    public CowGender update(Integer id, CowGender cowGender) {
        CowGender e = cowGenderRepository.findById(id).orElseThrow();
        e.setName(cowGender.getName());
        e.setRemark(cowGender.getRemark());
        return cowGenderRepository.save(e);
    }
}
