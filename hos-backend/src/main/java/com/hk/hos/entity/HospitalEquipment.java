package com.hk.hos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name="hospital_equipment")
@IdClass(HospitalEquipment.PK.class)
public class HospitalEquipment {
  @Id @Column(name="hospital_id") private Long hospitalId;
  @Id private String item;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="hospital_id", insertable=false, updatable=false)
  private Hospital hospital;

  @Data @NoArgsConstructor @AllArgsConstructor
  public static class PK implements java.io.Serializable {
    private Long hospitalId; private String item;
  }
}
