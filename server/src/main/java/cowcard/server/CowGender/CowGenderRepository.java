package cowcard.server.CowGender;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CowGenderRepository extends JpaRepository<CowGender, Integer> {
}
