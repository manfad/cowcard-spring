package cowcard.server.Semen;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cowcard.server.AiRecord.AiRecordRepository;
import cowcard.server.Cow.CowRepository;

@Service
public class SemenService {

    @Autowired
    private SemenRepository semenRepository;

    @Autowired
    private AiRecordRepository aiRecordRepository;

    @Autowired
    private CowRepository cowRepository;

    public List<Semen> findAll() {
        return semenRepository.findAll();
    }

    public Semen create(Semen semen) {
        return semenRepository.save(semen);
    }

    public Semen update(Integer id, Semen semen) {
        Semen e = semenRepository.findById(id).orElseThrow();
        e.setName(semen.getName());
        e.setSire(semen.getSire());
        e.setDate(semen.getDate());
        e.setStraw(semen.getStraw());
        e.setBull(semen.getBull());
        e.setRemark(semen.getRemark());
        return semenRepository.save(e);
    }

    public Semen toggleBull(Integer id) {
        Semen e = semenRepository.findById(id).orElseThrow();
        e.setBull(e.getBull() == null || !e.getBull());
        return semenRepository.save(e);
    }

    public SemenDetail getDetail(Integer id) {
        Semen semen = semenRepository.findById(id).orElseThrow();
        List<SemenAiRecordItem> aiRecords = aiRecordRepository
                .findBySemenId(id).stream().map(SemenAiRecordItem::from).toList();
        List<SemenCowItem> cows = cowRepository
                .findBySemenId(id).stream().map(SemenCowItem::from).toList();
        return SemenDetail.from(semen, aiRecords, cows);
    }

    public void deductStraw(Integer semenId) {
        Semen semen = semenRepository.findById(semenId).orElseThrow();
        if (semen.getStraw() == null || semen.getStraw() <= 0) {
            throw new RuntimeException("No straws remaining for semen ID: " + semenId);
        }
        semen.setStraw(semen.getStraw() - 1);
        semenRepository.save(semen);
    }
}
