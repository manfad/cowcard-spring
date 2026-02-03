package cowcard.server.Cow;

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
import java.math.BigDecimal;
import java.time.LocalDate;

import cowcard.server.Color.Color;
import cowcard.server.Common.BaseEntity;
import cowcard.server.CowGender.CowGender;
import cowcard.server.CowRole.CowRole;
import cowcard.server.CowStatus.CowStatus;
import cowcard.server.Feedlot.Feedlot;
import cowcard.server.Semen.Semen;
import cowcard.server.Transponder.Transponder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cows")
public class Cow extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "tag", nullable = false)
    private String tag;

    @ManyToOne
    @JoinColumn(name = "gender", referencedColumnName = "id", nullable = false)
    private CowGender gender;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "weight")
    private BigDecimal weight;

    @ManyToOne
    @JoinColumn(name = "color", referencedColumnName = "id")
    private Color color;

    @ManyToOne
    @JoinColumn(name = "role", referencedColumnName = "id")
    private CowRole role;

    @ManyToOne
    @JoinColumn(name = "status", referencedColumnName = "id")
    private CowStatus status;

    @ManyToOne
    @JoinColumn(name = "dam_id", referencedColumnName = "id")
    private Cow dam;

    @ManyToOne
    @JoinColumn(name = "semen_id", referencedColumnName = "id")
    private Semen semen;

    @ManyToOne
    @JoinColumn(name = "current_feedlot_id", referencedColumnName = "id")
    private Feedlot currentFeedlot;

    @ManyToOne
    @JoinColumn(name = "current_transponder_id", referencedColumnName = "id")
    private Transponder currentTransponder;

    @Column(name = "remark")
    private String remark;
}
