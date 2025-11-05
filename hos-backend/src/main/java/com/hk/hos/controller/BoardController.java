package com.hk.hos.controller;

import com.hk.hos.dto.UserResponse;
import com.hk.hos.entity.BoardPost;
import com.hk.hos.service.BoardService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService service;

    /**
     * 게시글 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<BoardPost>> list(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size) {
        Page<BoardPost> result = service.list(page, size);
        return ResponseEntity.ok(result);
    }

    /**
     * 게시글 생성 (세션 로그인 사용자 기반)
     * writer는 프론트에서 보내지 않고 세션 사용자 이름으로 자동 지정됨.
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<BoardPost> create(@RequestPart("title") String title,
                                            @RequestPart("content") String content,
                                            @RequestPart(value = "image", required = false) MultipartFile image,
                                            HttpSession session) {

        // 세션에서 로그인 사용자 정보 가져오기
        UserResponse me = (UserResponse) session.getAttribute(UserAuthController.SESSION_KEY);
        String writer = (me != null) ? me.getName() : "익명";

        // 서비스 호출 (writer 자동 주입)
        BoardPost created = service.create(title, content, writer, image);

        // 201 Created 응답과 함께 생성된 게시글 반환
        return ResponseEntity.status(201).body(created);
    }

    /**
     * 게시글 수정 (작성자 일치 여부는 서비스단에서 검증 가능)
     */
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<BoardPost> update(@PathVariable Long id,
                                            @RequestPart(required = false) String title,
                                            @RequestPart(required = false) String content,
                                            @RequestPart(required = false) MultipartFile image,
                                            HttpSession session) {

        UserResponse me = (UserResponse) session.getAttribute(UserAuthController.SESSION_KEY);
        String editor = (me != null) ? me.getName() : "익명";

        BoardPost updated = service.updateWithEditor(id, title, content, image, editor);
        return ResponseEntity.ok(updated);
    }

    /**
     * 게시글 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpSession session) {
        UserResponse me = (UserResponse) session.getAttribute(UserAuthController.SESSION_KEY);
        String deleter = (me != null) ? me.getName() : "익명";

        service.deleteWithAuth(id, deleter);
        return ResponseEntity.noContent().build();
    }
}
