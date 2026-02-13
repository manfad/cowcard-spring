package cowcard.server.PregnancyDiagnosis;

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

import cowcard.server.AiRecord.AiRecord;
import cowcard.server.Common.BaseEntity;
import cowcard.server.Inseminator.Inseminator;
import cowcard.server.PdStatus.PdStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pregnancy_diagnosis")
public class PregnancyDiagnosis extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "ai_record_id", referencedColumnName = "id", nullable = false)
    private AiRecord aiRecord;

    @Column(name = "ai_date", nullable = false)
    private String aiDate;

    @ManyToOne
    @JoinColumn(name = "diagnosis_by", referencedColumnName = "id")
    private Inseminator diagnosisBy;

    @ManyToOne
    @JoinColumn(name = "pd_status", referencedColumnName = "id")
    private PdStatus pdStatus;

    @Column(name = "pregnant_date")
    private String pregnantDate;
}
