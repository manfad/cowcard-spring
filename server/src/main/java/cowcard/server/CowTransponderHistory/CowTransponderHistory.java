package cowcard.server.CowTransponderHistory;

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
import java.time.LocalDateTime;

import cowcard.server.Common.BaseEntity;
import cowcard.server.Cow.Cow;
import cowcard.server.Transponder.Transponder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cow_transponder_history")
public class CowTransponderHistory extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "cow_id", referencedColumnName = "id", nullable = false)
    private Cow cow;

    @ManyToOne
    @JoinColumn(name = "transponder_id", referencedColumnName = "id", nullable = false)
    private Transponder transponder;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "unassigned_at")
    private LocalDateTime unassignedAt;
}
