package cowcard.server.Form;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Color.Color;
import cowcard.server.Color.ColorService;
import cowcard.server.Common.ServerRes;
import cowcard.server.Cow.Cow;
import cowcard.server.Cow.CowService;
import cowcard.server.CowGender.CowGender;
import cowcard.server.CowGender.CowGenderService;
import cowcard.server.CowRole.CowRole;
import cowcard.server.CowRole.CowRoleService;
import cowcard.server.CowStatus.CowStatus;
import cowcard.server.CowStatus.CowStatusService;
import cowcard.server.Semen.Semen;
import cowcard.server.Semen.SemenService;

@RestController
@RequestMapping("/form")
public class FormController {

    @Autowired
    private CowService cowService;

    @Autowired
    private CowStatusService cowStatusService;

    @Autowired
    private CowGenderService cowGenderService;

    @Autowired
    private CowRoleService cowRoleService;

    @Autowired
    private ColorService colorService;

    @Autowired
    private SemenService semenService;

    // --- Existing endpoints ---

    @PostMapping("/dam")
    public ServerRes<Cow> createDam(@RequestBody DamRequest request) {
        try {
            Cow cow = cowService.createDam(request.tag(), request.statusId(), request.remark());
            return ServerRes.success(cow);
        } catch (RuntimeException e) {
            return ServerRes.<Cow>error(e.getMessage());
        }
    }

    @GetMapping("/cow-statuses")
    public ServerRes<List<CowStatus>> getCowStatuses() {
        return ServerRes.success(cowStatusService.findAllActive());
    }

    // --- New lookup endpoints ---

    @GetMapping("/cow-genders")
    public ServerRes<List<CowGender>> getCowGenders() {
        return ServerRes.success(cowGenderService.findAllActive());
    }

    @GetMapping("/cow-roles")
    public ServerRes<List<CowRole>> getCowRoles(@RequestParam(required = false) Integer genderId) {
        List<CowRole> activeRoles = cowRoleService.findAllActive();
        if (genderId != null) {
            activeRoles = activeRoles.stream()
                    .filter(role -> role.getCowGenders().stream()
                            .anyMatch(g -> g.getId().equals(genderId)))
                    .toList();
        }
        return ServerRes.success(activeRoles);
    }

    @GetMapping("/colors")
    public ServerRes<List<Color>> getColors() {
        return ServerRes.success(colorService.findAllActive());
    }

    @GetMapping("/semen")
    public ServerRes<List<Semen>> getSemen() {
        return ServerRes.success(semenService.findAll());
    }

    @GetMapping("/dams")
    public ServerRes<List<DamOption>> getDams() {
        List<DamOption> dams = cowService.findDams().stream()
                .map(DamOption::from)
                .toList();
        return ServerRes.success(dams);
    }

    // --- Cow creation endpoint ---

    @PostMapping("/cow")
    public ServerRes<Cow> createCow(@RequestBody CowFormRequest request) {
        try {
            Cow cow = cowService.createCow(
                    request.tag(),
                    request.genderId(),
                    request.roleId(),
                    request.colorId(),
                    request.dob(),
                    request.weight(),
                    request.statusId(),
                    request.damId(),
                    request.semenId(),
                    request.remark()
            );
            return ServerRes.success(cow);
        } catch (RuntimeException e) {
            return ServerRes.<Cow>error(e.getMessage());
        }
    }

    // --- Calf creation endpoint ---

    @PostMapping("/calf")
    public ServerRes<Cow> createCalf(@RequestBody CalfFormRequest request) {
        try {
            Cow cow = cowService.createCalf(
                    request.tag(),
                    request.genderId(),
                    request.damId(),
                    request.semenId(),
                    request.dob(),
                    request.weight(),
                    request.colorId(),
                    request.remark()
            );
            return ServerRes.success(cow);
        } catch (RuntimeException e) {
            return ServerRes.<Cow>error(e.getMessage());
        }
    }

    // --- DTOs ---

    public record DamRequest(String tag, Integer statusId, String remark) {}

    public record CowFormRequest(
            String tag,
            Integer genderId,
            Integer roleId,
            Integer colorId,
            String dob,
            BigDecimal weight,
            Integer statusId,
            Integer damId,
            Integer semenId,
            String remark
    ) {}

    public record CalfFormRequest(
            String tag,
            Integer genderId,
            Integer damId,
            Integer semenId,
            String dob,
            BigDecimal weight,
            Integer colorId,
            String remark
    ) {}

    public record DamOption(Integer id, String tag) {
        public static DamOption from(Cow cow) {
            return new DamOption(cow.getId(), cow.getTag());
        }
    }
}
