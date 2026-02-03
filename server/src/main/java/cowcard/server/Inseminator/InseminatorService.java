package cowcard.server.Inseminator;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InseminatorService {

    @Autowired
    private InseminatorRepository inseminatorRepository;

    public List<Inseminator> findAll() {
        return inseminatorRepository.findAll();
    }
}
