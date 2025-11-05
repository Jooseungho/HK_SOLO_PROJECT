package com.hk.hos.repository;

import com.hk.hos.entity.BoardPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<BoardPost, Long> {
    Page<BoardPost> findAllByOrderByIdDesc(Pageable pageable);
}
