package cowcard.server.AiRecord;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AiRecordService {

    @Autowired
    private AiRecordRepository aiRecordRepository;

    public List<AiRecord> findAll() {
        return aiRecordRepository.findAll();
    }
}
