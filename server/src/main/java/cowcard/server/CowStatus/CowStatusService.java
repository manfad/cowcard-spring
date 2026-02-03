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
}
