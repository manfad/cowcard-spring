package cowcard.server.Cow;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CowRepository extends JpaRepository<Cow, Integer> {

    List<Cow> findByActiveTrue();

    List<Cow> findByRole_NameIgnoreCaseAndActiveTrue(String roleName);
}

