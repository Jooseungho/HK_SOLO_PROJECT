package com.hk.hos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name="users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String name;

    // ✅ 역할 필드 추가 (USER or ADMIN)
    @Column(nullable = false)
    private String role = "USER";
    
}
