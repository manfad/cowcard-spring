package cowcard.server.Semen;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SemenService {

    @Autowired
    private SemenRepository semenRepository;

    public List<Semen> findAll() {
        return semenRepository.findAll();
    }
}
