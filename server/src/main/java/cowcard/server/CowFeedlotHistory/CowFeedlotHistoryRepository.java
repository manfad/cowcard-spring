package cowcard.server.CowFeedlotHistory;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cowcard.server.Cow.Cow;
import cowcard.server.Feedlot.Feedlot;

@Repository
public interface CowFeedlotHistoryRepository extends JpaRepository<CowFeedlotHistory, Integer> {

    Optional<CowFeedlotHistory> findByCowAndMovedOutAtIsNull(Cow cow);

    boolean existsByFeedlotAndCowAndMovedOutAtIsNull(Feedlot feedlot, Cow cow);

    List<CowFeedlotHistory> findByFeedlot_IdOrderByMovedInAtDesc(Integer feedlotId);

    List<CowFeedlotHistory> findByCow_IdOrderByMovedInAtDesc(Integer cowId);
}
