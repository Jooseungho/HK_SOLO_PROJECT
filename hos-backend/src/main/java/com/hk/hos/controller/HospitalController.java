package com.hk.hos.controller;

import com.hk.hos.entity.Hospital;
import com.hk.hos.service.HospitalService;
import com.hk.hos.service.HospitalExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService service;
    private final HospitalExcelService excelService;

    /**
     * 병원 검색 API
     * 프론트 요청 예시:
     *   /api/hospitals?region=서울특별시+구로구&category=요양병원&page=0&size=100
     */
    @GetMapping
    public Page<Hospital> search(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        return service.search(region, category, keyword, page, size);
    }

    /**
     * 엑셀 파일로부터 병원 데이터 임포트 (관리자용)
     * POST /api/hospitals/import
     */
    @PostMapping("/import")
    public String importExcel() {
        excelService.importFromExcel();
        return "✅ 엑셀 데이터를 성공적으로 불러왔습니다.";
    }
}
