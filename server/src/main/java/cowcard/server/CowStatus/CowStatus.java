package cowcard.server.CowStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import cowcard.server.Common.BaseEntity;
import cowcard.server.CowRole.CowRole;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// Lookup IDs: 1=Active, 2=Cull, 3=Dead, 4=New Born, 5=Growing
@Entity
@Table(name = "cow_status")
public class CowStatus extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "remark")
    private String remark;

    @Column(name = "active")
    private Boolean active;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "cow_status_role",
        joinColumns = @JoinColumn(name = "cow_status_id"),
        inverseJoinColumns = @JoinColumn(name = "cow_role_id")
    )
    private List<CowRole> cowRoles = new ArrayList<>();
}
