package cowcard.server.PdStatus;

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
// Lookup IDs: 1=Pending, 2=AI Failed, 3=Pregnant, 4=No Pregnant, 5=Late Gestation, 6=Gestation, 7=NEW, 8=Complete, 9=Still Birth
@Entity
@Table(name = "pd_status")
public class PdStatus extends BaseEntity implements Serializable {
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

    @Column(name = "color")
    private String color;
}
