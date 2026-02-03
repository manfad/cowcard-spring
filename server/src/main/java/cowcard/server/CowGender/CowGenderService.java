package cowcard.server.CowGender;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CowGenderService {

    @Autowired
    private CowGenderRepository cowGenderRepository;

    public List<CowGender> findAll() {
        return cowGenderRepository.findAll();
    }
}
