package cowcard.server.CowGender;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CowGenderService {

    @Autowired
    private CowGenderRepository cowGenderRepository;

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

    public CowGender update(Integer id, CowGender cowGender) {
        CowGender e = cowGenderRepository.findById(id).orElseThrow();
        e.setName(cowGender.getName());
        e.setRemark(cowGender.getRemark());
        return cowGenderRepository.save(e);
    }
}
