package cowcard.server.PregnancyDiagnosis;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PregnancyDiagnosisRepository extends JpaRepository<PregnancyDiagnosis, Integer> {

    @Query("SELECT pd FROM PregnancyDiagnosis pd ORDER BY pd.aiRecord.aiDate DESC, pd.aiRecord.id DESC")
    List<PregnancyDiagnosis> findAllOrderByAiRecordAiDateDescIdDesc();

    List<PregnancyDiagnosis> findByDiagnosisById(Integer inseminatorId);

    Optional<PregnancyDiagnosis> findByAiRecordId(Integer aiRecordId);
}
