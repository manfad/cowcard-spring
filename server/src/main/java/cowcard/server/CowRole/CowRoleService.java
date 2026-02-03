package cowcard.server.CowRole;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CowRoleService {

    @Autowired
    private CowRoleRepository cowRoleRepository;

    public List<CowRole> findAll() {
        return cowRoleRepository.findAll();
    }
}
