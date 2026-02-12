package cowcard.server.AiStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AiStatusService {

    @Autowired
    private AiStatusRepository aiStatusRepository;

    public List<AiStatus> findAll() {
        return aiStatusRepository.findAll();
    }

    public List<AiStatus> findAllActive() {
        return aiStatusRepository.findByActiveTrue();
    }

    public AiStatus toggleActive(Integer id) {
        AiStatus e = aiStatusRepository.findById(id).orElseThrow();
        e.setActive(e.getActive() == null || !e.getActive());
        return aiStatusRepository.save(e);
    }

    public AiStatus create(AiStatus aiStatus) {
        aiStatus.setActive(true);
        return aiStatusRepository.save(aiStatus);
    }

    public AiStatus update(Integer id, AiStatus aiStatus) {
        AiStatus e = aiStatusRepository.findById(id).orElseThrow();
        e.setName(aiStatus.getName());
        e.setRemark(aiStatus.getRemark());
        return aiStatusRepository.save(e);
    }
}
