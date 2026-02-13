package cowcard.server.CowStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cowcard.server.Cow.CowRepository;
import cowcard.server.CowRole.CowRole;
import cowcard.server.CowRole.CowRoleRepository;

@Service
public class CowStatusService {

    @Autowired
    private CowStatusRepository cowStatusRepository;

    @Autowired
    private CowRepository cowRepository;

    @Autowired
    private CowRoleRepository cowRoleRepository;

    public List<CowStatus> findAll() {
        return cowStatusRepository.findAll();
    }

    public List<CowStatus> findAllActive() {
        return cowStatusRepository.findByActiveTrue();
    }

    public CowStatus toggleActive(Integer id) {
        CowStatus e = cowStatusRepository.findById(id).orElseThrow();
        e.setActive(e.getActive() == null || !e.getActive());
        return cowStatusRepository.save(e);
    }

    public CowStatus create(CowStatus cowStatus, List<Integer> cowRoleIds) {
        cowStatus.setActive(true);
        if (cowRoleIds != null && !cowRoleIds.isEmpty()) {
            List<CowRole> roles = cowRoleRepository.findAllById(cowRoleIds);
            cowStatus.setCowRoles(roles);
        }
        return cowStatusRepository.save(cowStatus);
    }

    public StatusWithCows getWithCows(Integer id) {
        CowStatus status = cowStatusRepository.findById(id).orElseThrow();
        List<StatusCowSummary> cows = cowRepository.findByStatusIdOrderByTag(id).stream()
                .map(StatusCowSummary::from).toList();
        return StatusWithCows.from(status, cows);
    }

    public CowStatus update(Integer id, CowStatus cowStatus, List<Integer> cowRoleIds) {
        CowStatus e = cowStatusRepository.findById(id).orElseThrow();
        e.setName(cowStatus.getName());
        e.setRemark(cowStatus.getRemark());
        if (cowRoleIds != null && !cowRoleIds.isEmpty()) {
            List<CowRole> roles = cowRoleRepository.findAllById(cowRoleIds);
            e.setCowRoles(roles);
        } else {
            e.getCowRoles().clear();
        }
        return cowStatusRepository.save(e);
    }
}
