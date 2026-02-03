package cowcard.server.PdStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PdStatusRepository extends JpaRepository<PdStatus, Integer> {
}
