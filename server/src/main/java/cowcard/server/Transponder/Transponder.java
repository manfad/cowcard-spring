package cowcard.server.Transponder;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;

import cowcard.server.Common.BaseEntity;
import cowcard.server.Feedlot.Feedlot;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "transponders")
public class Transponder extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "current_cow")
    private Integer currentCow;

    @ManyToOne
    @JoinColumn(name = "current_feedlot", referencedColumnName = "id")
    private Feedlot currentFeedlot;

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    @Column(name = "remark")
    private String remark;
}
