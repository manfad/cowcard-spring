package cowcard.server.Feedlot;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedlotRepository extends JpaRepository<Feedlot, Integer> {
    List<Feedlot> findByActiveTrue();
}
