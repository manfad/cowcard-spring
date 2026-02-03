package cowcard.server.TransponderRecord;

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
import cowcard.server.Cow.Cow;
import cowcard.server.Feedlot.Feedlot;
import cowcard.server.Transponder.Transponder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "transponder_records")
public class TransponderRecord extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "transponder_id", referencedColumnName = "id", nullable = false)
    private Transponder transponder;

    @ManyToOne
    @JoinColumn(name = "cow_id", referencedColumnName = "id")
    private Cow cow;

    @ManyToOne
    @JoinColumn(name = "feedlot_id", referencedColumnName = "id")
    private Feedlot feedlot;

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Column(name = "leave_date")
    private LocalDate leaveDate;
}
