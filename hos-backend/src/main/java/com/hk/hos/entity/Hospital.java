package com.hk.hos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "hospital")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;        // 병원명
    private String address;     // 전체 주소
    private String tel;         // 전화번호 (Excel 기준)
    private String phone;       // 추가 예비 전화 (선택)
    private String postcode;    // 우편번호
    private String homepage;    // 홈페이지
    private String region;      // 서울특별시 구 단위
    private String category;    // 병원 종류
    private Double latitude;    // 위도
    private Double longitude;   // 경도

    @Column(name = "veteran_affiliated")
    private boolean veteranAffiliated; // 보훈지정 여부

    @OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HospitalEquipment> equipments;
}
