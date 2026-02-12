package cowcard.server.CowStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CowStatusService {

    @Autowired
    private CowStatusRepository cowStatusRepository;

    public List<CowStatus> findAll() {
        return cowStatusRepository.findAll();
    }

    public List<CowStatus> findAllActive() {
        return cowStatusRepository.findByActiveTrue();
    }

    public CowStatus toggleActive(Integer id) {
        CowStatus e = cowStatusRepository.findById(id).orElseThrow();
        e.setActive(e.getActive() == null || !e.getActive());
        return cowStatusRepository.save(e);
    }

    public CowStatus create(CowStatus cowStatus) {
        cowStatus.setActive(true);
        return cowStatusRepository.save(cowStatus);
    }

    public CowStatus update(Integer id, CowStatus cowStatus) {
        CowStatus e = cowStatusRepository.findById(id).orElseThrow();
        e.setName(cowStatus.getName());
        e.setRemark(cowStatus.getRemark());
        return cowStatusRepository.save(e);
    }
}
