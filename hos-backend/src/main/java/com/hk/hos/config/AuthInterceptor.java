package com.hk.hos.config;

import com.hk.hos.controller.UserAuthController;
import com.hk.hos.dto.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
        String uri = req.getRequestURI();
        String method = req.getMethod();

        // ✅ 로그인 없이 접근 가능한 공개 API (화이트리스트)
        boolean isPublic =
                uri.startsWith("/api/users/login") ||
                uri.startsWith("/api/users/signup") ||
                uri.startsWith("/api/users/logout") ||
                uri.startsWith("/api/users/me") ||
                uri.startsWith("/api/hospitals") || // 병원 목록 비로그인 허용
                (uri.startsWith("/api/boards") && "GET".equalsIgnoreCase(method)) || // 게시판 조회 허용
                uri.startsWith("/files/") ||
                uri.startsWith("/error") ||
                uri.startsWith("/css") ||
                uri.startsWith("/js") ||
                uri.startsWith("/images");

        if (isPublic) return true;

        // ✅ 기존 세션만 조회 (없으면 null 반환)
        HttpSession session = req.getSession(false);

        if (session == null) {
            System.out.println("[AuthInterceptor] ❌ 세션 없음 - " + uri);
            deny(res, "세션이 없습니다. 로그인 후 이용해주세요.");
            return false;
        }

        // ✅ 세션에 사용자 정보가 있는지 확인
        UserResponse me = (UserResponse) session.getAttribute(UserAuthController.SESSION_KEY);
        if (me == null) {
            System.out.println("[AuthInterceptor] ⚠️ 로그인 정보 없음 - " + uri);
            deny(res, "로그인이 필요합니다.");
            return false;
        }

        // ✅ 로그인 상태 유지 로그 (디버그용)
        System.out.println("[AuthInterceptor] ✅ 로그인 확인: " + me.getEmail() + " → " + uri);
        return true;
    }

    /** 401 응답을 JSON으로 반환 */
    private void deny(HttpServletResponse res, String msg) throws Exception {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json;charset=UTF-8");

        // ✅ CORS 헤더 강제 추가 (프론트에서 fetch로 받을 수 있도록)
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:8081");
        res.setHeader("Access-Control-Allow-Credentials", "true");

        res.getWriter().write("{\"code\":401,\"msg\":\"" + msg + "\"}");
    }
}
