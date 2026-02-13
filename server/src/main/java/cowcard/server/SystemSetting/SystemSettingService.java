package cowcard.server.SystemSetting;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SystemSettingService {

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    public List<SystemSetting> findAll() {
        return systemSettingRepository.findAll();
    }

    public Optional<SystemSetting> findByName(String name) {
        return systemSettingRepository.findByName(name);
    }

    public SystemSetting create(SystemSetting setting) {
        return systemSettingRepository.save(setting);
    }

    public SystemSetting update(Integer id, SystemSetting updated) {
        SystemSetting e = systemSettingRepository.findById(id).orElseThrow();
        e.setName(updated.getName());
        e.setValue(updated.getValue());
        e.setRemark(updated.getRemark());
        return systemSettingRepository.save(e);
    }
}
