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

    List<Cow> findByColorId(Integer colorId);

    List<Cow> findByGenderId(Integer genderId);

    List<Cow> findByRoleId(Integer roleId);

    List<Cow> findByStatusId(Integer statusId);

    List<Cow> findByCurrentFeedlotId(Integer feedlotId);

    List<Cow> findByDamId(Integer damId);

    List<Cow> findBySemenId(Integer semenId);
}

