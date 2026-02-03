package cowcard.server.Transponder;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransponderService {

    @Autowired
    private TransponderRepository transponderRepository;

    public List<Transponder> findAll() {
        return transponderRepository.findAll();
    }
}
