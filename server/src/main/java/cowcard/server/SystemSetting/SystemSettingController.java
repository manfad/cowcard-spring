package cowcard.server.SystemSetting;

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

@RestController
@RequestMapping("/system-setting")
public class SystemSettingController {

    @Autowired
    private SystemSettingService systemSettingService;

    @Autowired
    private CronService cronService;

    @GetMapping("/all")
    public ServerRes<List<SystemSetting>> getAll() {
        return ServerRes.success(systemSettingService.findAll());
    }

    @PostMapping
    public ServerRes<SystemSetting> create(@RequestBody SystemSettingRequest request) {
        SystemSetting setting = new SystemSetting();
        setting.setName(request.name());
        setting.setValue(request.value());
        setting.setRemark(request.remark());
        return ServerRes.success(systemSettingService.create(setting));
    }

    @PutMapping("/{id}")
    public ServerRes<SystemSetting> update(@PathVariable Integer id, @RequestBody SystemSettingRequest request) {
        SystemSetting setting = new SystemSetting();
        setting.setName(request.name());
        setting.setValue(request.value());
        setting.setRemark(request.remark());
        return ServerRes.success(systemSettingService.update(id, setting));
    }

    @PostMapping("/run-cron")
    public ServerRes<String> runCron() {
        cronService.execute();
        return ServerRes.success("Cron job executed successfully");
    }

    public record SystemSettingRequest(String name, String value, String remark) {}
}
