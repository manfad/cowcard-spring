package cowcard.server.CowTransponderHistory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CowTransponderHistoryRepository extends JpaRepository<CowTransponderHistory, Integer> {
}
