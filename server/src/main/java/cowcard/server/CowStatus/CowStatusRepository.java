package cowcard.server.CowStatus;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CowStatusRepository extends JpaRepository<CowStatus, Integer> {
    List<CowStatus> findByActiveTrue();
}
