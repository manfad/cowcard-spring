package cowcard.server.Feedlot;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cowcard.server.Common.ServerRes;
import cowcard.server.Cow.Cow;
import cowcard.server.Cow.CowRepository;
import cowcard.server.Cow.CowView;
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

    public List<FeedlotDto> findAllDto() {
        return feedlotRepository.findAll().stream()
                .map(f -> FeedlotDto.from(f, cowRepository.countByCurrentFeedlotId(f.getId())))
                .toList();
    }

    public List<FeedlotDto> findAllActiveDto() {
        return feedlotRepository.findByActiveTrue().stream()
                .map(f -> FeedlotDto.from(f, cowRepository.countByCurrentFeedlotId(f.getId())))
                .toList();
    }

    public FeedlotDetail getDetail(Integer id) {
        Feedlot feedlot = feedlotRepository.findById(id).orElseThrow();
        List<FeedlotCowSummary> cows = cowRepository.findByCurrentFeedlotIdOrderByTag(id).stream()
                .map(FeedlotCowSummary::from).toList();
        List<FeedlotHistorySummary> history = cowFeedlotHistoryRepository.findByFeedlot_IdOrderByMovedInAtDesc(id).stream()
                .map(FeedlotHistorySummary::from).toList();
        return FeedlotDetail.from(feedlot, cows, history);
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

    public ServerRes<FeedlotWithCows> getWithCows(Integer feedlotId) {
        Feedlot feedlot = feedlotRepository.findById(feedlotId).orElse(null);
        if (feedlot == null) {
            return ServerRes.<FeedlotWithCows>error("Feedlot with id " + feedlotId + " not found");
        }

        // Single query with JOIN FETCH to avoid N+1
        List<CowFeedlotHistory> activeHistories = cowFeedlotHistoryRepository
                .findActiveByFeedlotWithCowDetails(feedlotId);

        List<CowView> cows = activeHistories.stream()
                .map(h -> CowView.from(h.getCow()))
                .collect(Collectors.toList());

        return ServerRes.success(FeedlotWithCows.from(feedlot, cows));
    }

    @Transactional
    public ServerRes<FeedlotWithCows> assignBulk(Integer feedlotId, List<Integer> cowIds) {
        Feedlot feedlot = feedlotRepository.findById(feedlotId).orElse(null);
        if (feedlot == null) {
            return ServerRes.<FeedlotWithCows>error("Feedlot with id " + feedlotId + " not found");
        }

        List<Cow> cows = cowRepository.findAllById(cowIds);
        if (cows.isEmpty()) {
            return ServerRes.<FeedlotWithCows>error("No valid cows found for the given IDs");
        }

        LocalDateTime now = LocalDateTime.now();

        // Fetch all active feedlot history records for these cows in one query
        List<CowFeedlotHistory> activeHistories = cowFeedlotHistoryRepository
                .findByCowInAndMovedOutAtIsNull(cows);

        for (Cow cow : cows) {
            // Find existing active history for this cow (if any)
            Optional<CowFeedlotHistory> existingActive = activeHistories.stream()
                    .filter(h -> h.getCow().getId().equals(cow.getId()))
                    .findFirst();

            if (existingActive.isPresent()) {
                CowFeedlotHistory activeHistory = existingActive.get();

                // If already in this feedlot, skip
                if (activeHistory.getFeedlot().getId().equals(feedlotId)) {
                    continue;
                }

                // Close the old history record
                activeHistory.setMovedOutAt(now);
                cowFeedlotHistoryRepository.save(activeHistory);
            }

            // Create new history record
            CowFeedlotHistory history = new CowFeedlotHistory();
            history.setCow(cow);
            history.setFeedlot(feedlot);
            history.setMovedInAt(now);
            cowFeedlotHistoryRepository.save(history);

            // Update cow's current feedlot reference
            cow.setCurrentFeedlot(feedlot);
            cowRepository.save(cow);
        }

        // Return updated feedlot with cows
        List<CowFeedlotHistory> updatedHistories = cowFeedlotHistoryRepository
                .findByFeedlotAndMovedOutAtIsNull(feedlot);

        List<CowView> cowViews = updatedHistories.stream()
                .map(h -> CowView.from(h.getCow()))
                .collect(Collectors.toList());

        return ServerRes.success(FeedlotWithCows.from(feedlot, cowViews),
                "Cows assigned to feedlot successfully");
    }

    @Transactional
    public ServerRes<Void> unassignBulk(List<Integer> cowIds) {
        List<Cow> cows = cowRepository.findAllById(cowIds);
        if (cows.isEmpty()) {
            return ServerRes.<Void>error("No valid cows found for the given IDs");
        }

        LocalDateTime now = LocalDateTime.now();

        List<CowFeedlotHistory> activeHistories = cowFeedlotHistoryRepository
                .findByCowInAndMovedOutAtIsNull(cows);

        for (CowFeedlotHistory history : activeHistories) {
            history.setMovedOutAt(now);
            cowFeedlotHistoryRepository.save(history);

            // Clear the cow's current feedlot reference
            Cow cow = history.getCow();
            cow.setCurrentFeedlot(null);
            cowRepository.save(cow);
        }

        return ServerRes.success(null, "Cows unassigned from feedlot successfully");
    }
}
