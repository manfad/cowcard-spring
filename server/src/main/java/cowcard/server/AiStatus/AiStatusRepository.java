package cowcard.server.AiStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiStatusRepository extends JpaRepository<AiStatus, Integer> {
}
