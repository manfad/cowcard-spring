package cowcard.server.Auth.dto;

import java.util.UUID;

public class WhoAmI {
    private UUID id;
    private String email;
    private String name;
    private Boolean admin;

    public WhoAmI(UUID id, String email, String name, Boolean admin) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.admin = admin;
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public Boolean getAdmin() { return admin; }
}
