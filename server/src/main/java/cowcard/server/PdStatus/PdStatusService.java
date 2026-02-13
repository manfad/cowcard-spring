package cowcard.server.PdStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PdStatusService {

    @Autowired
    private PdStatusRepository pdStatusRepository;

    public List<PdStatus> findAll() {
        return pdStatusRepository.findAll();
    }

    public List<PdStatus> findAllActive() {
        return pdStatusRepository.findByActiveTrue();
    }

    public PdStatus toggleActive(Integer id) {
        PdStatus e = pdStatusRepository.findById(id).orElseThrow();
        e.setActive(e.getActive() == null || !e.getActive());
        return pdStatusRepository.save(e);
    }

    public PdStatus create(PdStatus pdStatus) {
        pdStatus.setActive(true);
        return pdStatusRepository.save(pdStatus);
    }

    public PdStatus update(Integer id, PdStatus pdStatus) {
        PdStatus e = pdStatusRepository.findById(id).orElseThrow();
        e.setName(pdStatus.getName());
        e.setRemark(pdStatus.getRemark());
        e.setColor(pdStatus.getColor());
        return pdStatusRepository.save(e);
    }
}
