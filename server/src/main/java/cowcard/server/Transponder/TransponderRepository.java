package cowcard.server.Transponder;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransponderRepository extends JpaRepository<Transponder, Integer> {

    List<Transponder> findByCurrentCowIsNull();
}
