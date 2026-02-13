package cowcard.server.CalfRecord;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalfRecordRepository extends JpaRepository<CalfRecord, Integer> {

    Optional<CalfRecord> findByAiRecordId(Integer aiRecordId);
}
