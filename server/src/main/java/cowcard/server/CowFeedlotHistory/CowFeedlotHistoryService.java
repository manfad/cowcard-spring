package cowcard.server.CowFeedlotHistory;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CowFeedlotHistoryService {

    @Autowired
    private CowFeedlotHistoryRepository cowFeedlotHistoryRepository;

    public List<CowFeedlotHistory> findAll() {
        return cowFeedlotHistoryRepository.findAll();
    }

    public List<CowFeedlotHistory> findByFeedlotId(Integer feedlotId) {
        return cowFeedlotHistoryRepository.findByFeedlot_IdOrderByMovedInAtDesc(feedlotId);
    }

    public List<CowFeedlotHistory> findByCowId(Integer cowId) {
        return cowFeedlotHistoryRepository.findByCow_IdOrderByMovedInAtDesc(cowId);
    }
}
