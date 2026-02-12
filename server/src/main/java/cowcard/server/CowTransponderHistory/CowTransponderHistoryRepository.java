package cowcard.server.CowTransponderHistory;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cowcard.server.Cow.Cow;
import cowcard.server.Transponder.Transponder;

@Repository
public interface CowTransponderHistoryRepository extends JpaRepository<CowTransponderHistory, Integer> {

    Optional<CowTransponderHistory> findByTransponderAndUnassignedAtIsNull(Transponder transponder);

    boolean existsByTransponderAndCowAndUnassignedAtIsNull(Transponder transponder, Cow cow);

    Optional<CowTransponderHistory> findByCowAndUnassignedAtIsNull(Cow cow);

    List<CowTransponderHistory> findByTransponder_IdOrderByAssignedAtDesc(Integer transponderId);

    List<CowTransponderHistory> findByCow_IdOrderByAssignedAtDesc(Integer cowId);
}
