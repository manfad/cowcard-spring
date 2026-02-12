package cowcard.server.CalfStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CalfStatusService {

    @Autowired
    private CalfStatusRepository calfStatusRepository;

    public List<CalfStatus> findAll() {
        return calfStatusRepository.findAll();
    }

    public List<CalfStatus> findAllActive() {
        return calfStatusRepository.findByActiveTrue();
    }

    public CalfStatus toggleActive(Integer id) {
        CalfStatus e = calfStatusRepository.findById(id).orElseThrow();
        e.setActive(e.getActive() == null || !e.getActive());
        return calfStatusRepository.save(e);
    }

    public CalfStatus create(CalfStatus calfStatus) {
        calfStatus.setActive(true);
        return calfStatusRepository.save(calfStatus);
    }

    public CalfStatus update(Integer id, CalfStatus calfStatus) {
        CalfStatus e = calfStatusRepository.findById(id).orElseThrow();
        e.setName(calfStatus.getName());
        e.setRemark(calfStatus.getRemark());
        return calfStatusRepository.save(e);
    }
}
