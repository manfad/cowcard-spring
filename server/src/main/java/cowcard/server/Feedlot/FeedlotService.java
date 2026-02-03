package cowcard.server.Feedlot;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FeedlotService {

    @Autowired
    private FeedlotRepository feedlotRepository;

    public List<Feedlot> findAll() {
        return feedlotRepository.findAll();
    }
}
