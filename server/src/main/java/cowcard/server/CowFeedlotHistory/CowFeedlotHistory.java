package cowcard.server.CowFeedlotHistory;

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
import cowcard.server.Feedlot.Feedlot;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cow_feedlot_history")
public class CowFeedlotHistory extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "cow_id", referencedColumnName = "id", nullable = false)
    private Cow cow;

    @ManyToOne
    @JoinColumn(name = "feedlot_id", referencedColumnName = "id", nullable = false)
    private Feedlot feedlot;

    @Column(name = "moved_in_at", nullable = false)
    private LocalDateTime movedInAt;

    @Column(name = "moved_out_at")
    private LocalDateTime movedOutAt;
}
