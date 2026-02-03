package cowcard.server.CalfRecord;

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
import cowcard.server.Cow.Cow;
import cowcard.server.PregnancyDiagnosis.PregnancyDiagnosis;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "calf_record")
public class CalfRecord extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "cow_id", referencedColumnName = "id", nullable = false)
    private Cow cow;

    @ManyToOne
    @JoinColumn(name = "ai_record_id", referencedColumnName = "id", nullable = false)
    private AiRecord aiRecord;

    @ManyToOne
    @JoinColumn(name = "pd_id", referencedColumnName = "id", nullable = false)
    private PregnancyDiagnosis pregnancyDiagnosis;
}
