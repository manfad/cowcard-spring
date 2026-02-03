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
}
