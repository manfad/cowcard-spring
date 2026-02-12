package cowcard.server.Common;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import lombok.EqualsAndHashCode;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@EqualsAndHashCode(callSuper = false)
public class BaseEntity {
    @JsonIgnore
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @JsonIgnore
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private UUID createdBy;

    @JsonIgnore
    @LastModifiedBy
    @Column(name = "updated_by")
    private UUID updatedBy;
}
