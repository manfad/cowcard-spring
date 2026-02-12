package cowcard.server.CowRole;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cowcard.server.CowGender.CowGender;
import cowcard.server.CowGender.CowGenderRepository;

@Service
public class CowRoleService {

    @Autowired
    private CowRoleRepository cowRoleRepository;

    @Autowired
    private CowGenderRepository cowGenderRepository;

    public List<CowRole> findAll() {
        return cowRoleRepository.findAll();
    }

    public List<CowRole> findAllActive() {
        return cowRoleRepository.findByActiveTrue();
    }

    public CowRole toggleActive(Integer id) {
        CowRole e = cowRoleRepository.findById(id).orElseThrow();
        e.setActive(e.getActive() == null || !e.getActive());
        return cowRoleRepository.save(e);
    }

    public CowRole create(CowRole cowRole, List<Integer> cowGenderIds) {
        cowRole.setActive(true);
        if (cowGenderIds != null && !cowGenderIds.isEmpty()) {
            List<CowGender> genders = cowGenderRepository.findAllById(cowGenderIds);
            cowRole.setCowGenders(genders);
        }
        return cowRoleRepository.save(cowRole);
    }

    public CowRole update(Integer id, CowRole cowRole, List<Integer> cowGenderIds) {
        CowRole e = cowRoleRepository.findById(id).orElseThrow();
        e.setName(cowRole.getName());
        e.setRemark(cowRole.getRemark());
        if (cowGenderIds != null && !cowGenderIds.isEmpty()) {
            List<CowGender> genders = cowGenderRepository.findAllById(cowGenderIds);
            e.setCowGenders(genders);
        } else {
            e.getCowGenders().clear();
        }
        return cowRoleRepository.save(e);
    }
}
