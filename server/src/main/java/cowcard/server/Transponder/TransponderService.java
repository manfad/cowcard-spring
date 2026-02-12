package cowcard.server.Transponder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cowcard.server.Common.ServerRes;
import cowcard.server.Cow.Cow;
import cowcard.server.Cow.CowRepository;
import cowcard.server.CowTransponderHistory.CowTransponderHistory;
import cowcard.server.CowTransponderHistory.CowTransponderHistoryRepository;

@Service
public class TransponderService {

    @Autowired
    private TransponderRepository transponderRepository;

    @Autowired
    private CowRepository cowRepository;

    @Autowired
    private CowTransponderHistoryRepository cowTransponderHistoryRepository;

    public List<Transponder> findAll() {
        return transponderRepository.findAll();
    }

    public List<Transponder> findAvailable() {
        return transponderRepository.findByCurrentCowIsNull();
    }

    public Transponder create(Transponder transponder) {
        return transponderRepository.save(transponder);
    }

    public Transponder update(Integer id, Transponder transponder) {
        Transponder e = transponderRepository.findById(id).orElseThrow();
        e.setCode(transponder.getCode());
        e.setRemark(transponder.getRemark());
        return transponderRepository.save(e);
    }

    @Transactional
    public ServerRes<Transponder> assign(Integer transponderId, Integer cowId) {
        Transponder transponder = transponderRepository.findById(transponderId).orElse(null);
        if (transponder == null) {
            return ServerRes.<Transponder>error("Transponder with id " + transponderId + " not found");
        }

        Cow cow = cowRepository.findById(cowId).orElse(null);
        if (cow == null) {
            return ServerRes.<Transponder>error("Cow with id " + cowId + " not found");
        }

        // Check if this transponder is already assigned to this same cow
        if (cowTransponderHistoryRepository.existsByTransponderAndCowAndUnassignedAtIsNull(transponder, cow)) {
            return ServerRes.<Transponder>error("Transponder is already assigned to this cow");
        }

        // If transponder is currently assigned to a different cow, unassign first
        Optional<CowTransponderHistory> existingActive = cowTransponderHistoryRepository
                .findByTransponderAndUnassignedAtIsNull(transponder);

        if (existingActive.isPresent()) {
            CowTransponderHistory oldHistory = existingActive.get();
            oldHistory.setUnassignedAt(LocalDateTime.now());
            cowTransponderHistoryRepository.save(oldHistory);

            // Clear the old cow's currentTransponder
            Cow oldCow = oldHistory.getCow();
            oldCow.setCurrentTransponder(null);
            cowRepository.save(oldCow);
        }

        // If the cow already has a different transponder assigned, unassign it first
        if (cow.getCurrentTransponder() != null && !cow.getCurrentTransponder().getId().equals(transponderId)) {
            Transponder oldTransponder = cow.getCurrentTransponder();

            Optional<CowTransponderHistory> cowActiveHistory = cowTransponderHistoryRepository
                    .findByCowAndUnassignedAtIsNull(cow);

            if (cowActiveHistory.isPresent()) {
                CowTransponderHistory oldCowHistory = cowActiveHistory.get();
                oldCowHistory.setUnassignedAt(LocalDateTime.now());
                cowTransponderHistoryRepository.save(oldCowHistory);
            }

            oldTransponder.setCurrentCow(null);
            oldTransponder.setAssignedDate(null);
            transponderRepository.save(oldTransponder);
        }

        // Create new history record
        CowTransponderHistory history = new CowTransponderHistory();
        history.setCow(cow);
        history.setTransponder(transponder);
        history.setAssignedAt(LocalDateTime.now());
        cowTransponderHistoryRepository.save(history);

        // Update transponder's current state
        transponder.setCurrentCow(cow);
        transponder.setAssignedDate(LocalDate.now());
        transponderRepository.save(transponder);

        // Update cow's current transponder
        cow.setCurrentTransponder(transponder);
        cowRepository.save(cow);

        return ServerRes.success(transponder, "Transponder assigned successfully");
    }

    @Transactional
    public ServerRes<Transponder> unassign(Integer transponderId) {
        Transponder transponder = transponderRepository.findById(transponderId).orElse(null);
        if (transponder == null) {
            return ServerRes.<Transponder>error("Transponder with id " + transponderId + " not found");
        }

        Optional<CowTransponderHistory> activeHistory = cowTransponderHistoryRepository
                .findByTransponderAndUnassignedAtIsNull(transponder);

        if (activeHistory.isEmpty()) {
            return ServerRes.<Transponder>error("Transponder is not currently assigned to any cow");
        }

        // Close the history record
        CowTransponderHistory history = activeHistory.get();
        history.setUnassignedAt(LocalDateTime.now());
        cowTransponderHistoryRepository.save(history);

        // Clear the cow's currentTransponder
        Cow cow = history.getCow();
        cow.setCurrentTransponder(null);
        cowRepository.save(cow);

        // Clear the transponder's current state
        transponder.setCurrentCow(null);
        transponder.setAssignedDate(null);
        transponderRepository.save(transponder);

        return ServerRes.success(transponder, "Transponder unassigned successfully");
    }
}
