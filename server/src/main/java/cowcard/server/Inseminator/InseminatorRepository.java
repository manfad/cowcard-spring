package cowcard.server.Inseminator;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InseminatorRepository extends JpaRepository<Inseminator, Integer> {
    List<Inseminator> findByActiveTrue();
}
