package com.hk.hos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="board_post")
public class BoardPost {

  @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  private String title;

  @Column(columnDefinition="TEXT")
  private String content;

  private String writer;

  @Column(name="image_url")
  private String imageUrl;

  @Column(name="created_at")
  private LocalDateTime createdAt;

  @Column(name="updated_at")
  private LocalDateTime updatedAt;

  // ✅ 최초 생성 시 자동으로 createdAt, updatedAt 둘 다 설정
  @PrePersist
  void onCreate() {
      if (createdAt == null) createdAt = LocalDateTime.now();
      updatedAt = LocalDateTime.now();
  }

  // ✅ 업데이트 시 자동 갱신
  @PreUpdate
  void onUpdate() {
      updatedAt = LocalDateTime.now();
  }
}
