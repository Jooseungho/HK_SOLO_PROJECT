package com.hk.hos.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/users/login",
                        "/api/users/signup",
                        "/api/users/logout",
                        "/api/users/me",
                        "/files/**"
                );
    }

    // ✅ 업로드된 이미지 접근 허용
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:./upl/");
    }

    // ✅ CORS 설정 (프론트 <-> 백 간 세션 쿠키 허용)
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // ✅ API + 파일 접근 모두 허용
                .allowedOrigins("http://localhost:8081") // ✅ 프론트 포트만 명시
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .exposedHeaders("Set-Cookie");
    }
}
