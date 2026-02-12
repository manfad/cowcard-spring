package cowcard.server.CowFeedlotHistory;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import cowcard.server.Cow.Cow;
import cowcard.server.Feedlot.Feedlot;

@Repository
public interface CowFeedlotHistoryRepository extends JpaRepository<CowFeedlotHistory, Integer> {

    Optional<CowFeedlotHistory> findByCowAndMovedOutAtIsNull(Cow cow);

    boolean existsByFeedlotAndCowAndMovedOutAtIsNull(Feedlot feedlot, Cow cow);

    List<CowFeedlotHistory> findByFeedlot_IdOrderByMovedInAtDesc(Integer feedlotId);

    List<CowFeedlotHistory> findByCow_IdOrderByMovedInAtDesc(Integer cowId);

    List<CowFeedlotHistory> findByFeedlotAndMovedOutAtIsNull(Feedlot feedlot);

    List<CowFeedlotHistory> findByCowInAndMovedOutAtIsNull(List<Cow> cows);

    @Query("SELECT h FROM CowFeedlotHistory h " +
           "JOIN FETCH h.cow c " +
           "LEFT JOIN FETCH c.gender " +
           "LEFT JOIN FETCH c.role " +
           "LEFT JOIN FETCH c.status " +
           "LEFT JOIN FETCH c.currentFeedlot " +
           "LEFT JOIN FETCH c.currentTransponder " +
           "WHERE h.feedlot.id = :feedlotId AND h.movedOutAt IS NULL")
    List<CowFeedlotHistory> findActiveByFeedlotWithCowDetails(@Param("feedlotId") Integer feedlotId);
}
