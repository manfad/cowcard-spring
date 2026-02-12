package cowcard.server.Cow;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cowcard.server.Color.Color;
import cowcard.server.Color.ColorRepository;
import cowcard.server.CowGender.CowGender;
import cowcard.server.CowGender.CowGenderRepository;
import cowcard.server.CowRole.CowRole;
import cowcard.server.CowRole.CowRoleRepository;
import cowcard.server.CowStatus.CowStatus;
import cowcard.server.CowStatus.CowStatusRepository;
import cowcard.server.Semen.Semen;
import cowcard.server.Semen.SemenRepository;

@Service
public class CowService {

    @Autowired
    private CowRepository cowRepository;

    @Autowired
    private CowGenderRepository cowGenderRepository;

    @Autowired
    private CowRoleRepository cowRoleRepository;

    @Autowired
    private CowStatusRepository cowStatusRepository;

    @Autowired
    private ColorRepository colorRepository;

    @Autowired
    private SemenRepository semenRepository;

    public List<Cow> findAll() {
        return cowRepository.findAll();
    }

    public List<CowView> findAllView() {
        return cowRepository.findAll().stream().map(CowView::from).toList();
    }

    public List<CowView> findAllActiveView() {
        return cowRepository.findByActiveTrue().stream().map(CowView::from).toList();
    }

    public Cow createDam(String tag, Integer statusId, String remark) {
        CowGender femaleGender = cowGenderRepository.findByNameIgnoreCase("Female")
                .orElseThrow(() -> new RuntimeException("CowGender 'Female' not found"));

        CowRole damRole = cowRoleRepository.findByNameIgnoreCase("Dam")
                .orElseThrow(() -> new RuntimeException("CowRole 'Dam' not found"));

        CowStatus status = cowStatusRepository.findById(statusId)
                .orElseThrow(() -> new RuntimeException("CowStatus with id " + statusId + " not found"));

        Cow cow = new Cow();
        cow.setTag(tag);
        cow.setGender(femaleGender);
        cow.setRole(damRole);
        cow.setStatus(status);
        cow.setRemark(remark);
        cow.setActive(true);
        return cowRepository.save(cow);
    }

    public List<Cow> findDams() {
        return cowRepository.findByRole_NameIgnoreCaseAndActiveTrue("Dam");
    }

    public Cow createCow(String tag, Integer genderId, Integer roleId, Integer colorId,
                          String dob, BigDecimal weight, Integer statusId,
                          Integer damId, Integer semenId, String remark) {
        CowGender gender = cowGenderRepository.findById(genderId)
                .orElseThrow(() -> new RuntimeException("CowGender with id " + genderId + " not found"));

        CowRole role = cowRoleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("CowRole with id " + roleId + " not found"));

        Color color = colorRepository.findById(colorId)
                .orElseThrow(() -> new RuntimeException("Color with id " + colorId + " not found"));

        CowStatus status = cowStatusRepository.findById(statusId)
                .orElseThrow(() -> new RuntimeException("CowStatus with id " + statusId + " not found"));

        Cow cow = new Cow();
        cow.setTag(tag);
        cow.setGender(gender);
        cow.setRole(role);
        cow.setColor(color);
        cow.setStatus(status);
        cow.setRemark(remark);
        cow.setActive(true);

        if (dob != null && !dob.isBlank()) {
            cow.setDob(LocalDate.parse(dob));
        }

        cow.setWeight(weight);

        if (damId != null) {
            Cow dam = cowRepository.findById(damId)
                    .orElseThrow(() -> new RuntimeException("Dam (Cow) with id " + damId + " not found"));
            cow.setDam(dam);
        }

        if (semenId != null) {
            Semen semen = semenRepository.findById(semenId)
                    .orElseThrow(() -> new RuntimeException("Semen with id " + semenId + " not found"));
            cow.setSemen(semen);
        }

        return cowRepository.save(cow);
    }

    public Cow createCalf(String tag, Integer genderId, Integer damId, Integer semenId,
                           String dob, BigDecimal weight, Integer colorId, String remark) {
        CowRole calfRole = cowRoleRepository.findByNameIgnoreCase("Calf")
                .orElseThrow(() -> new RuntimeException("CowRole 'Calf' not found"));

        CowGender gender = cowGenderRepository.findById(genderId)
                .orElseThrow(() -> new RuntimeException("CowGender with id " + genderId + " not found"));

        Color color = colorRepository.findById(colorId)
                .orElseThrow(() -> new RuntimeException("Color with id " + colorId + " not found"));

        Cow cow = new Cow();
        cow.setTag(tag);
        cow.setGender(gender);
        cow.setRole(calfRole);
        cow.setColor(color);
        cow.setRemark(remark);
        cow.setActive(true);

        if (dob != null && !dob.isBlank()) {
            cow.setDob(LocalDate.parse(dob));
        }

        cow.setWeight(weight);

        if (damId != null) {
            Cow dam = cowRepository.findById(damId)
                    .orElseThrow(() -> new RuntimeException("Dam (Cow) with id " + damId + " not found"));
            cow.setDam(dam);
        }

        if (semenId != null) {
            Semen semen = semenRepository.findById(semenId)
                    .orElseThrow(() -> new RuntimeException("Semen with id " + semenId + " not found"));
            cow.setSemen(semen);
        }

        return cowRepository.save(cow);
    }
}
