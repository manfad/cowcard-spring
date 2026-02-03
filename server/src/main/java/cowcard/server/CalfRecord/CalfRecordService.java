package cowcard.server.CalfRecord;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CalfRecordService {

    @Autowired
    private CalfRecordRepository calfRecordRepository;

    public List<CalfRecord> findAll() {
        return calfRecordRepository.findAll();
    }
}
