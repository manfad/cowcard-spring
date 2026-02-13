package cowcard.server.PdStatus;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PdStatusRepository extends JpaRepository<PdStatus, Integer> {
    @Query("SELECT p FROM PdStatus p ORDER BY p.id ASC")
    List<PdStatus> findAllOrderByIdAsc();

    @Query("SELECT p FROM PdStatus p WHERE p.active = true ORDER BY p.id ASC")
    List<PdStatus> findByActiveTrueOrderByIdAsc();
}
