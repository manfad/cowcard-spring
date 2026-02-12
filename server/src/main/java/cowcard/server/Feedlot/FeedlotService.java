package cowcard.server.Feedlot;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cowcard.server.Common.ServerRes;
import cowcard.server.Cow.Cow;
import cowcard.server.Cow.CowRepository;
import cowcard.server.CowFeedlotHistory.CowFeedlotHistory;
import cowcard.server.CowFeedlotHistory.CowFeedlotHistoryRepository;

@Service
public class FeedlotService {

    @Autowired
    private FeedlotRepository feedlotRepository;

    @Autowired
    private CowRepository cowRepository;

    @Autowired
    private CowFeedlotHistoryRepository cowFeedlotHistoryRepository;

    public List<Feedlot> findAll() {
        return feedlotRepository.findAll();
    }

    public List<Feedlot> findAllActive() {
        return feedlotRepository.findByActiveTrue();
    }

    public Feedlot toggleActive(Integer id) {
        Feedlot e = feedlotRepository.findById(id).orElseThrow();
        e.setActive(e.getActive() == null || !e.getActive());
        return feedlotRepository.save(e);
    }

    public Feedlot create(Feedlot feedlot) {
        feedlot.setActive(true);
        return feedlotRepository.save(feedlot);
    }

    public Feedlot update(Integer id, Feedlot feedlot) {
        Feedlot e = feedlotRepository.findById(id).orElseThrow();
        e.setName(feedlot.getName());
        e.setRemark(feedlot.getRemark());
        return feedlotRepository.save(e);
    }

    @Transactional
    public ServerRes<Feedlot> assign(Integer feedlotId, Integer cowId) {
        Feedlot feedlot = feedlotRepository.findById(feedlotId).orElse(null);
        if (feedlot == null) {
            return ServerRes.<Feedlot>error("Feedlot with id " + feedlotId + " not found");
        }

        Cow cow = cowRepository.findById(cowId).orElse(null);
        if (cow == null) {
            return ServerRes.<Feedlot>error("Cow with id " + cowId + " not found");
        }

        // Check if this cow is already in this same feedlot (active record)
        if (cowFeedlotHistoryRepository.existsByFeedlotAndCowAndMovedOutAtIsNull(feedlot, cow)) {
            return ServerRes.<Feedlot>error("Cow is already in this feedlot");
        }

        // If the cow is currently in a different feedlot, auto-close that old history record
        Optional<CowFeedlotHistory> existingActive = cowFeedlotHistoryRepository
                .findByCowAndMovedOutAtIsNull(cow);

        if (existingActive.isPresent()) {
            CowFeedlotHistory oldHistory = existingActive.get();
            oldHistory.setMovedOutAt(LocalDateTime.now());
            cowFeedlotHistoryRepository.save(oldHistory);
        }

        // Create new history record
        CowFeedlotHistory history = new CowFeedlotHistory();
        history.setCow(cow);
        history.setFeedlot(feedlot);
        history.setMovedInAt(LocalDateTime.now());
        cowFeedlotHistoryRepository.save(history);

        // Update cow's current feedlot reference
        cow.setCurrentFeedlot(feedlot);
        cowRepository.save(cow);

        return ServerRes.success(feedlot, "Cow moved to feedlot successfully");
    }

    @Transactional
    public ServerRes<Feedlot> unassign(Integer cowId) {
        Cow cow = cowRepository.findById(cowId).orElse(null);
        if (cow == null) {
            return ServerRes.<Feedlot>error("Cow with id " + cowId + " not found");
        }

        Optional<CowFeedlotHistory> activeHistory = cowFeedlotHistoryRepository
                .findByCowAndMovedOutAtIsNull(cow);

        if (activeHistory.isEmpty()) {
            return ServerRes.<Feedlot>error("Cow is not currently in any feedlot");
        }

        // Close the history record
        CowFeedlotHistory history = activeHistory.get();
        history.setMovedOutAt(LocalDateTime.now());
        cowFeedlotHistoryRepository.save(history);

        Feedlot feedlot = history.getFeedlot();

        // Clear the cow's current feedlot reference
        cow.setCurrentFeedlot(null);
        cowRepository.save(cow);

        return ServerRes.success(feedlot, "Cow removed from feedlot successfully");
    }
}
