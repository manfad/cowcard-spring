package cowcard.server.TransponderRecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransponderRecordRepository extends JpaRepository<TransponderRecord, Integer> {
}
