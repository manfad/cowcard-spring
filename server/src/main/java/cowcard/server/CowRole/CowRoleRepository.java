package cowcard.server.CowRole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CowRoleRepository extends JpaRepository<CowRole, Integer> {
}
