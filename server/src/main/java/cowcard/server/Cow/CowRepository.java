package cowcard.server.Cow;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CowRepository extends JpaRepository<Cow, Integer> {

    List<Cow> findByActiveTrue();

    @Query("SELECT c FROM Cow c ORDER BY c.tag ASC")
    List<Cow> findAllOrderByTag();

    @Query("SELECT c FROM Cow c WHERE c.active = true ORDER BY c.tag ASC")
    List<Cow> findAllActiveOrderByTag();

    List<Cow> findByRole_NameIgnoreCaseAndActiveTrue(String roleName);

    long countByCurrentFeedlotId(Integer feedlotId);

    @Query("SELECT c FROM Cow c WHERE c.color.id = :colorId ORDER BY c.tag ASC")
    List<Cow> findByColorIdOrderByTag(Integer colorId);

    @Query("SELECT c FROM Cow c WHERE c.gender.id = :genderId ORDER BY c.tag ASC")
    List<Cow> findByGenderIdOrderByTag(Integer genderId);

    @Query("SELECT c FROM Cow c WHERE c.role.id = :roleId ORDER BY c.tag ASC")
    List<Cow> findByRoleIdOrderByTag(Integer roleId);

    @Query("SELECT c FROM Cow c WHERE c.status.id = :statusId ORDER BY c.tag ASC")
    List<Cow> findByStatusIdOrderByTag(Integer statusId);

    @Query("SELECT c FROM Cow c WHERE c.currentFeedlot.id = :feedlotId ORDER BY c.tag ASC")
    List<Cow> findByCurrentFeedlotIdOrderByTag(Integer feedlotId);

    List<Cow> findByDamId(Integer damId);

    List<Cow> findBySemenId(Integer semenId);
}

