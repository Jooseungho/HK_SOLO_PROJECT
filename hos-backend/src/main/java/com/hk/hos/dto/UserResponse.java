package com.hk.hos.dto;

import lombok.AllArgsConstructor; 
import lombok.Getter;

@Getter 
@AllArgsConstructor 
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String role;  // ✅ 역할 필드 추가
}
