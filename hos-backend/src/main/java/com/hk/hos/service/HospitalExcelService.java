package com.hk.hos.service;

import com.hk.hos.entity.Hospital;
import com.hk.hos.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.json.JSONObject;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class HospitalExcelService {

    private final HospitalRepository hospitalRepository;

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    public void importFromExcel() {
        try {
            ClassPathResource resource = new ClassPathResource("data/병원 리스트.xlsx");
            InputStream is = resource.getInputStream();

            Workbook workbook = WorkbookFactory.create(is);
            Sheet sheet = workbook.getSheetAt(0);
            int rowCount = 0;

            for (Row row : sheet) {
                if (rowCount++ == 0) continue; // 헤더 스킵

                Hospital hospital = new Hospital();
                hospital.setName(getString(row, 1));       // 병원명
                hospital.setCategory(getString(row, 2));   // 병원/약국구분
                hospital.setTel(getString(row, 3));        // 전화번호
                hospital.setPostcode(getString(row, 4));   // 우편번호
                hospital.setAddress(getString(row, 5));    // 주소
                hospital.setRegion(extractRegion(getString(row, 5)));

                // ✅ 홈페이지 처리
                String homepage = getString(row, 6);
                if (homepage != null && !homepage.isBlank()) {
                    if (!homepage.startsWith("http")) {
                        homepage = "https://" + homepage.trim();
                    }
                    hospital.setHomepage(homepage);
                }

                // ✅ 주소 정제
                String cleanAddr = cleanAddress(hospital.getAddress());
                hospital.setAddress(cleanAddr);

                // ✅ 좌표 조회 (선택적)
                double[] coords = getCoordinatesFromKakao(cleanAddr);
                hospital.setLatitude(coords[0]);
                hospital.setLongitude(coords[1]);

                hospitalRepository.save(hospital);
            }

            workbook.close();
            log.info("✅ 병원 엑셀 데이터 import 완료 ({} rows)", rowCount - 1);

        } catch (Exception e) {
            log.error("❌ 엑셀 import 중 오류 발생", e);
        }
    }

    private String getString(Row row, int idx) {
        if (row == null || row.getCell(idx) == null) return "";
        row.getCell(idx).setCellType(CellType.STRING);
        return row.getCell(idx).getStringCellValue().trim();
    }

    private String cleanAddress(String addr) {
        if (addr == null) return null;
        return addr.replaceAll("\\(.*?\\)", "")
                   .replaceAll(",.*", "")
                   .replaceAll("\\s{2,}", " ")
                   .trim();
    }

    /** ✅ 주소에서 시/구 정보 자동 추출 (정확히 구까지 포함) */
    private String extractRegion(String address) {
        if (address == null) return "";
        if (address.contains("서울특별시")) {
            int start = address.indexOf("서울특별시");
            // ✅ "서울특별시" 다음에 오는 "xx구"를 정규식으로 정확히 추출
            java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile("서울특별시\\s*([가-힣]+구)")
                .matcher(address);
            if (matcher.find()) {
                return "서울특별시 " + matcher.group(1).trim();
            }
        }
        return "";
    }


    private double[] getCoordinatesFromKakao(String address) {
        double[] coords = {0.0, 0.0};
        try {
            String query = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + query;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JSONObject json = new JSONObject(response.getBody());
                if (json.has("documents") && json.getJSONArray("documents").length() > 0) {
                    JSONObject doc = json.getJSONArray("documents").getJSONObject(0);
                    coords[0] = doc.getDouble("y");
                    coords[1] = doc.getDouble("x");
                    log.info("📍 {} → ({}, {})", address, coords[0], coords[1]);
                } else {
                    log.warn("⚠️ 주소 변환 실패: {}", address);
                }
            }
        } catch (Exception e) {
            log.warn("⚠️ Kakao API 호출 실패: {}", address);
        }
        return coords;
    }
}
