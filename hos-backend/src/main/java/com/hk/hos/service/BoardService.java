package com.hk.hos.service;

import com.hk.hos.entity.BoardPost;
import com.hk.hos.repository.BoardRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository repo;

    @Value("${file.upload-dir}")
    private String uploadDir; // application.properties의 upl 경로 사용

    private Path absoluteUploadPath; // 실제 경로 캐싱

    /**
     * ✅ 서버 시작 시 upl 폴더 존재 여부 확인 및 자동 생성
     */
    @PostConstruct
    public void init() {
        try {
            absoluteUploadPath = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(absoluteUploadPath);
            System.out.println("[BoardService] 업로드 경로 초기화 완료: " + absoluteUploadPath);
        } catch (Exception e) {
            throw new RuntimeException("업로드 디렉토리 생성 실패: " + uploadDir, e);
        }
    }

    /**
     * ✅ 게시글 목록 조회 (최신순)
     */
    public Page<BoardPost> list(int page, int size) {
        return repo.findAllByOrderByIdDesc(PageRequest.of(page, size));
    }

    /**
     * ✅ 게시글 생성
     */
    public BoardPost create(String title, String content, String writer, MultipartFile image) {
        String url = save(image);
        BoardPost post = BoardPost.builder()
                .title(title)
                .content(content)
                .writer(writer)
                .imageUrl(url)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return repo.save(post);
    }

    /**
     * ✅ 게시글 수정 (프론트 PUT /api/boards/{id})
     */
    public BoardPost update(Long id, String title, String content, MultipartFile image) {
        BoardPost post = repo.findById(id).orElseThrow(() ->
                new RuntimeException("게시글을 찾을 수 없습니다. (id: " + id + ")"));

        if (title != null) post.setTitle(title);
        if (content != null) post.setContent(content);
        if (image != null && !image.isEmpty()) post.setImageUrl(save(image));

        // ✅ 수정 시간 갱신
        post.setUpdatedAt(LocalDateTime.now());
        return repo.save(post);
    }

    /**
     * ✅ 게시글 수정 (세션 로그인 사용자 기반)
     */
    public BoardPost updateWithEditor(Long id, String title, String content, MultipartFile image, String editor) {
        BoardPost post = repo.findById(id).orElseThrow(() ->
                new RuntimeException("게시글을 찾을 수 없습니다. (id: " + id + ")"));

        if (title != null) post.setTitle(title);
        if (content != null) post.setContent(content);
        if (image != null && !image.isEmpty()) post.setImageUrl(save(image));

        // ✅ 수정 시간 자동 갱신
        post.setUpdatedAt(LocalDateTime.now());

        return repo.save(post);
    }

    /**
     * ✅ 게시글 삭제 (관리자/작성자 검증 포함)
     */
    public void deleteWithAuth(Long id, String deleter) {
        BoardPost post = repo.findById(id).orElseThrow(() ->
                new RuntimeException("게시글을 찾을 수 없습니다. (id: " + id + ")"));

        // ✅ 관리자 또는 작성자 본인만 삭제 가능
        boolean isAdmin = "관리자".equalsIgnoreCase(deleter) || "admin".equalsIgnoreCase(deleter);
        boolean isWriter = post.getWriter() != null && post.getWriter().equals(deleter);

        if (!isAdmin && !isWriter) {
            throw new RuntimeException("삭제 권한이 없습니다. (작성자 또는 관리자만 가능)");
        }

        repo.delete(post);
    }

    /**
     * ✅ 이미지 저장 처리 (upl 폴더에 저장)
     */
    private String save(MultipartFile f) {
        if (f == null || f.isEmpty()) return null;
        try {
            // 파일 이름 유니크하게 생성
            String name = UUID.randomUUID() + "_" + f.getOriginalFilename();

            // 절대 경로 기반으로 저장
            Path path = absoluteUploadPath.resolve(name);

            // 파일 저장
            f.transferTo(path.toFile());

            System.out.println("[BoardService] 이미지 저장 완료: " + path);

            // ✅ 프론트에서 접근 가능한 절대 URL 반환 (8080 기준)
            return "http://localhost:8080/files/" + name;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("이미지 저장 실패: " + e.getMessage(), e);
        }
    }
}
