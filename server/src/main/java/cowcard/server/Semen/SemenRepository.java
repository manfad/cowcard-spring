package cowcard.server.Semen;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SemenRepository extends JpaRepository<Semen, Integer> {
}
