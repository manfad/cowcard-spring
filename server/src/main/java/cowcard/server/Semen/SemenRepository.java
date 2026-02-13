package cowcard.server.Semen;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SemenRepository extends JpaRepository<Semen, Integer> {

    @Query("SELECT s FROM Semen s ORDER BY s.bull ASC NULLS FIRST, s.date ASC")
    List<Semen> findAllOrderByBullAscDateAsc();
}
