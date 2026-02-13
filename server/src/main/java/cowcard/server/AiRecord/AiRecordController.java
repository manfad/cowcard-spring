package cowcard.server.AiRecord;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cowcard.server.Common.ServerRes;
import cowcard.server.Cow.Cow;
import cowcard.server.Inseminator.Inseminator;
import cowcard.server.Semen.Semen;

@RestController
@RequestMapping("/ai-record")
public class AiRecordController {

    @Autowired
    private AiRecordService aiRecordService;

    public record CreateAiRecordRequest(
            Integer damId,
            Integer semenId,
            String aiDate,
            String aiTime,
            Integer aiById,
            Integer preparedById,
            String remark) {
    }

    @GetMapping("/{id}/detail")
    public ServerRes<AiRecordDetail> getDetail(@PathVariable Integer id) {
        return ServerRes.success(aiRecordService.getDetail(id));
    }

    @GetMapping("/all")
    public ServerRes<List<AiRecord>> getAll() {
        return ServerRes.success(aiRecordService.findAll());
    }

    @GetMapping("/next-code")
    public ServerRes<String> getNextCode() {
        return ServerRes.success(aiRecordService.generateNextCode());
    }

    @GetMapping("/dam-ai-record")
    public ServerRes<List<DamAiRecord>> getDamAiRecord() {
        return ServerRes.success(aiRecordService.getDamAiRecord());
    }

    @GetMapping("/dam-ai-count/{damId}")
    public ServerRes<Long> getDamNonBullAiCount(@PathVariable Integer damId) {
        return ServerRes.success(aiRecordService.countNonBullAiRecords(damId));
    }

    public record UpdateAiStatusRequest(Integer aiStatusId) {
    }

    @PutMapping("/{id}/update-status")
    public ServerRes<AiRecord> updateStatus(@PathVariable Integer id,
                                            @RequestBody UpdateAiStatusRequest request) {
        return ServerRes.success(aiRecordService.updateStatus(id, request.aiStatusId()));
    }

    @PostMapping
    public ServerRes<AiRecord> create(@RequestBody CreateAiRecordRequest request) {
        AiRecord aiRecord = new AiRecord();
        aiRecord.setAiDate(request.aiDate());
        aiRecord.setAiTime(request.aiTime());
        aiRecord.setRemark(request.remark());

        // Set relationships by reference
        Cow dam = new Cow();
        dam.setId(request.damId());
        aiRecord.setDam(dam);

        Semen semen = new Semen();
        semen.setId(request.semenId());
        aiRecord.setSemen(semen);

        if (request.aiById() != null) {
            Inseminator aiBy = new Inseminator();
            aiBy.setId(request.aiById());
            aiRecord.setAiBy(aiBy);
        }

        if (request.preparedById() != null) {
            Inseminator preparedBy = new Inseminator();
            preparedBy.setId(request.preparedById());
            aiRecord.setPreparedBy(preparedBy);
        }

        try {
            return ServerRes.success(aiRecordService.create(aiRecord, request.semenId()));
        } catch (RuntimeException e) {
            return ServerRes.<AiRecord>error(e.getMessage());
        }
    }
}
