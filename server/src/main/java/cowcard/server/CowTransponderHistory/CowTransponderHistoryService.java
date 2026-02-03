package cowcard.server.CowTransponderHistory;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CowTransponderHistoryService {

    @Autowired
    private CowTransponderHistoryRepository cowTransponderHistoryRepository;

    public List<CowTransponderHistory> findAll() {
        return cowTransponderHistoryRepository.findAll();
    }
}
