package cowcard.server.SystemSetting;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class CronService {

    private static final Logger log = LoggerFactory.getLogger(CronService.class);

    @Scheduled(cron = "0 0 0 * * *") // Midnight daily
    public void execute() {
        log.info("Cron job executed");
    }
}
