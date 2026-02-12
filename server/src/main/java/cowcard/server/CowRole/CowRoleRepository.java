package cowcard.server.CowRole;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CowRoleRepository extends JpaRepository<CowRole, Integer> {
    List<CowRole> findByActiveTrue();
    Optional<CowRole> findByNameIgnoreCase(String name);
}
