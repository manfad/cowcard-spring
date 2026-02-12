package cowcard.server.CowGender;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CowGenderRepository extends JpaRepository<CowGender, Integer> {
    List<CowGender> findByActiveTrue();
    Optional<CowGender> findByNameIgnoreCase(String name);
}
