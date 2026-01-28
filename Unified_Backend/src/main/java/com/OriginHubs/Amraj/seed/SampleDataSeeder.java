package com.OriginHubs.Amraj.seed;

import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.OriginHubs.Amraj.entity.Hub;
import com.OriginHubs.Amraj.entity.UserAccount;
import com.OriginHubs.Amraj.entity.UserActivityLog;
import com.OriginHubs.Amraj.entity.enums.AccessLevel;
import com.OriginHubs.Amraj.entity.enums.ActivityType;
import com.OriginHubs.Amraj.entity.enums.HubStatus;
import com.OriginHubs.Amraj.entity.enums.RoleType;
import com.OriginHubs.Amraj.entity.enums.UserStatus;
import com.OriginHubs.Amraj.repository.HubManagementRepository;
import com.OriginHubs.Amraj.repository.UserAccountRepository;
import com.OriginHubs.Amraj.repository.UserActivityLogRepository;

import jakarta.transaction.Transactional;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = false)
public class SampleDataSeeder implements CommandLineRunner {

    private final HubManagementRepository hubRepository;
    private final UserAccountRepository userAccountRepository;
    private final UserActivityLogRepository activityLogRepository;
    private final boolean seedEnabled;

    public SampleDataSeeder(
            HubManagementRepository hubRepository,
            UserAccountRepository userAccountRepository,
            UserActivityLogRepository activityLogRepository,
            @Value("${app.seed.enabled:true}") boolean seedEnabled) {
        this.hubRepository = hubRepository;
        this.userAccountRepository = userAccountRepository;
        this.activityLogRepository = activityLogRepository;
        this.seedEnabled = seedEnabled;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled || userAccountRepository.count() > 0) {
            return;
        }

        Hub central = hubRepository.save(createHub("HUB-001", "Central Hub", "Bengaluru"));
        Hub west = hubRepository.save(createHub("HUB-002", "West Hub", "Mumbai"));
        Hub east = hubRepository.save(createHub("HUB-003", "East Hub", "Kolkata"));

        List<UserAccount> seededUsers = List.of(
                createUser("USR-1001", "Priya Nair", "priya.super@adi.aam", RoleType.SUPER_ADMIN, UserStatus.ACTIVE, AccessLevel.ADMIN, central),
                createUser("USR-1002", "Rohan Gupta", "rohan.hub@adi.aam", RoleType.HUB_ADMIN, UserStatus.ACTIVE, AccessLevel.ADMIN, west),
                createUser("USR-1003", "Meera Sharma", "meera.hub@adi.aam", RoleType.HUB_ADMIN, UserStatus.ACTIVE, AccessLevel.WRITE, central),
                createUser("USR-1004", "Amit Jain", "amit.delivery@adi.aam", RoleType.DELIVERY_PARTNER, UserStatus.ACTIVE, AccessLevel.WRITE, west),
                createUser("USR-1005", "Neha Rao", "neha.delivery@adi.aam", RoleType.DELIVERY_PARTNER, UserStatus.INACTIVE, AccessLevel.WRITE, east),
                createUser("USR-1006", "Vikram Singh", "vikram.customer@adi.aam", RoleType.CUSTOMER, UserStatus.ACTIVE, AccessLevel.READ, null),
                createUser("USR-1007", "Sara Khan", "sara.customer@adi.aam", RoleType.CUSTOMER, UserStatus.ACTIVE, AccessLevel.READ, null),
                createUser("USR-1008", "Imran Qureshi", "imran.delivery@adi.aam", RoleType.DELIVERY_PARTNER, UserStatus.ACTIVE, AccessLevel.WRITE, east),
                createUser("USR-1009", "Arjun Patel", "arjun.ops@adi.aam", RoleType.HUB_ADMIN, UserStatus.INACTIVE, AccessLevel.WRITE, east),
                createUser("USR-1010", "Divya Iyer", "divya.ops@adi.aam", RoleType.HUB_ADMIN, UserStatus.ACTIVE, AccessLevel.ADMIN, central)
        );

        userAccountRepository.saveAll(seededUsers);
        seededUsers.forEach(user -> createLoginHistory(user, randomLoginCount(), randomDescription(user.getRole())));
    }

    private Hub createHub(String code, String name, String location) {
        Hub hub = new Hub();
        hub.setCode(code);
        hub.setName(name);
        hub.setLocation(location);
        hub.setStatus(HubStatus.ACTIVE);
        return hub;
    }

    private UserAccount createUser(String code, String name, String email, RoleType role, UserStatus status, AccessLevel accessLevel, Hub hub) {
        UserAccount account = new UserAccount();
        account.setUserCode(code);
        account.setFullName(name);
        account.setEmail(email.toLowerCase(Locale.ENGLISH));
        account.setPhone("+91" + ThreadLocalRandom.current().nextInt(700000000, 999999999));
        account.setRole(role);
        account.setStatus(status);
        account.setAccessLevel(accessLevel);
        account.setAssignedHub(hub);
        return account;
    }

    private void createLoginHistory(UserAccount user, int count, String description) {
        String[] ipAddresses = {
            "192.168.1.100", "192.168.1.101", "203.0.113.45", 
            "198.51.100.22", "10.0.0.50", "172.16.0.15"
        };
        String[] devices = {
            "Chrome 120.0 / Windows 10", "Safari 17.2 / macOS 14.2",
            "Chrome 120.0 / Android 13", "Safari 17.0 / iOS 17.2",
            "Firefox 121.0 / Ubuntu 22.04", "Edge 120.0 / Windows 11",
            "Chrome 120.0 / macOS 14.1", "Samsung Internet / Android 14"
        };
        
        for (int i = 0; i < count; i++) {
            UserActivityLog log = new UserActivityLog();
            log.setUser(user);
            log.setActivityType(ActivityType.LOGIN);
            log.setDescription(description);
            log.setIpAddress(ipAddresses[ThreadLocalRandom.current().nextInt(ipAddresses.length)]);
            log.setDeviceInfo(devices[ThreadLocalRandom.current().nextInt(devices.length)]);
            activityLogRepository.save(log);
        }
    }

    private int randomLoginCount() {
        return ThreadLocalRandom.current().nextInt(1, 5);
    }

    private String randomDescription(RoleType role) {
        return switch (role) {
            case SUPER_ADMIN -> "Super admin dashboard access";
            case HUB_ADMIN -> "Hub oversight login";
            case DELIVERY_PARTNER -> "Delivery partner shift start";
            case CUSTOMER -> "Customer account session";
        };
    }
}
