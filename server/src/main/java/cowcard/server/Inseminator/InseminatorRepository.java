package cowcard.server.Inseminator;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InseminatorRepository extends JpaRepository<Inseminator, Integer> {
}
