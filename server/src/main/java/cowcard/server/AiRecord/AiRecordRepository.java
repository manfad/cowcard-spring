package cowcard.server.AiRecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiRecordRepository extends JpaRepository<AiRecord, Integer> {
    long countByCodeStartingWith(String prefix);
}
