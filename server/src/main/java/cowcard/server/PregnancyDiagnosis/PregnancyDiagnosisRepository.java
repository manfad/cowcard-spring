package cowcard.server.PregnancyDiagnosis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PregnancyDiagnosisRepository extends JpaRepository<PregnancyDiagnosis, Integer> {
}
