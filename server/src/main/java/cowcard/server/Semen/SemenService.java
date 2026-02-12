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

    public void deductStraw(Integer semenId) {
        Semen semen = semenRepository.findById(semenId).orElseThrow();
        if (semen.getStraw() == null || semen.getStraw() <= 0) {
            throw new RuntimeException("No straws remaining for semen ID: " + semenId);
        }
        semen.setStraw(semen.getStraw() - 1);
        semenRepository.save(semen);
    }
}
