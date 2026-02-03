package cowcard.server.TransponderRecord;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransponderRecordService {

    @Autowired
    private TransponderRecordRepository transponderRecordRepository;

    public List<TransponderRecord> findAll() {
        return transponderRecordRepository.findAll();
    }
}
