package com.hk.hos.service;

import com.hk.hos.entity.Hospital;
import com.hk.hos.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository repo;

    /**
     * 병원 검색
     * - region, category, keyword는 빈 문자열("")이면 null 로 처리
     * - LIKE 검색이 동작하도록 Repository 쿼리와 연계
     */
    public Page<Hospital> search(String region, String category, String keyword, int page, int size) {
        if (region != null && region.trim().isEmpty()) region = null;
        if (category != null && category.trim().isEmpty()) category = null;
        if (keyword != null && keyword.trim().isEmpty()) keyword = null;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        return repo.search(region, category, keyword, pageable);
    }
}
