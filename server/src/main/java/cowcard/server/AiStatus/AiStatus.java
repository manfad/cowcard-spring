package cowcard.server.AiStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

import cowcard.server.Common.BaseEntity;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// Lookup IDs: 1=Success, 2=Failed, 3=Pending
@Entity
@Table(name = "ai_status")
public class AiStatus extends BaseEntity implements Serializable {
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
}
