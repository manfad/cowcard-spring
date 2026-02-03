package cowcard.server.Transponder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransponderRepository extends JpaRepository<Transponder, Integer> {
}
