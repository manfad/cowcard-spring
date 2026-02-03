package cowcard.server.Cow;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CowService {

    @Autowired
    private CowRepository cowRepository;

    public List<Cow> findAll() {
        return cowRepository.findAll();
    }
}
