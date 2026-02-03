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
}
