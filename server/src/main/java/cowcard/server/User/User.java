package cowcard.server.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "id")
	private UUID id;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "email", nullable = false)
	private String email;

	@Column(name = "phone", nullable = false)
	private String phone;

	@Column(name = "admin")
	private Boolean admin;

	@Column(name = "approved", nullable = false)
	private Boolean approved;

	@Column(name = "last_login")
	private LocalDateTime lastLogin;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "password")
	private String password;

	@Column(name = "active")
	private Boolean active = true;

	public User() {}

	public UUID getId() { return id; }
	public void setId(UUID id) { this.id = id; }

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getPhone() { return phone; }
	public void setPhone(String phone) { this.phone = phone; }

	public Boolean getAdmin() { return admin; }
	public void setAdmin(Boolean admin) { this.admin = admin; }

	public Boolean getApproved() { return approved; }
	public void setApproved(Boolean approved) { this.approved = approved; }

	public LocalDateTime getLastLogin() { return lastLogin; }
	public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }

	public Boolean getActive() { return active; }
	public void setActive(Boolean active) { this.active = active; }
}
