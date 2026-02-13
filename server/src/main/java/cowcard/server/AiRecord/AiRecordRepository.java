package cowcard.server.AiRecord;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiRecordRepository extends JpaRepository<AiRecord, Integer> {
    long countByCodeStartingWith(String prefix);

    long countByDamIdAndSemenBullFalse(Integer damId);

    List<AiRecord> findBySemenBullFalseOrderByDamIdAscAiDateAsc();

    List<AiRecord> findByAiById(Integer id);

    List<AiRecord> findByPreparedById(Integer id);

    List<AiRecord> findByDamId(Integer damId);

    List<AiRecord> findBySemenId(Integer semenId);
}
