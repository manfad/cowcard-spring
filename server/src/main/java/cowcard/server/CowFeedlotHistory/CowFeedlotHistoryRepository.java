package cowcard.server.CowFeedlotHistory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CowFeedlotHistoryRepository extends JpaRepository<CowFeedlotHistory, Integer> {
}
