package cowcard.server.AiRecord;

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
import java.time.LocalTime;

import cowcard.server.AiStatus.AiStatus;
import cowcard.server.Common.BaseEntity;
import cowcard.server.Cow.Cow;
import cowcard.server.Feedlot.Feedlot;
import cowcard.server.Inseminator.Inseminator;
import cowcard.server.Semen.Semen;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_records")
public class AiRecord extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "code")
    private String code;

    @ManyToOne
    @JoinColumn(name = "dam_id", referencedColumnName = "id", nullable = false)
    private Cow dam;

    @ManyToOne
    @JoinColumn(name = "semen_id", referencedColumnName = "id", nullable = false)
    private Semen semen;

    @ManyToOne
    @JoinColumn(name = "feedlot_id", referencedColumnName = "id")
    private Feedlot feedlot;

    @ManyToOne
    @JoinColumn(name = "ai_by", referencedColumnName = "id")
    private Inseminator aiBy;

    @ManyToOne
    @JoinColumn(name = "prepared_by", referencedColumnName = "id")
    private Inseminator preparedBy;

    @ManyToOne
    @JoinColumn(name = "status", referencedColumnName = "id")
    private AiStatus status;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "ai_date")
    private LocalDate aiDate;

    @Column(name = "ai_time")
    private LocalTime aiTime;

    @Column(name = "remark")
    private String remark;
}
