package com.hk.hos.repository;

import com.hk.hos.entity.Hospital;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

	@Query("""
		    SELECT h FROM Hospital h
		    WHERE (:region IS NULL OR LOWER(h.region) LIKE LOWER(CONCAT('%', :region, '%')))
		      AND (:category IS NULL OR LOWER(h.category) LIKE LOWER(CONCAT('%', :category, '%')))
		      AND (:keyword IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
		""")
		Page<Hospital> search(@Param("region") String region,
		                      @Param("category") String category,
		                      @Param("keyword") String keyword,
		                      Pageable pageable);



}
