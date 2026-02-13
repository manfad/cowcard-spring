package cowcard.server.PregnancyDiagnosis;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PregnancyDiagnosisRepository extends JpaRepository<PregnancyDiagnosis, Integer> {

    List<PregnancyDiagnosis> findByDiagnosisById(Integer inseminatorId);

    Optional<PregnancyDiagnosis> findByAiRecordId(Integer aiRecordId);
}
