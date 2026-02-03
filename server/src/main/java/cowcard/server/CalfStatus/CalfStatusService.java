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
}
