package com.hk.hos.repository;

import com.hk.hos.entity.HospitalEquipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalEquipmentRepository extends JpaRepository<HospitalEquipment, HospitalEquipment.PK> {
}
