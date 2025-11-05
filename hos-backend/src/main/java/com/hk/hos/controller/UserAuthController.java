package com.hk.hos.controller;

import com.hk.hos.dto.*;
import com.hk.hos.entity.User;
import com.hk.hos.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserAuthController {

    private final UserService userService;
    public static final String SESSION_KEY = "LOGIN_USER";

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody SignupRequest req) {
        userService.signup(req.getEmail(), req.getName(), req.getPassword());
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody LoginRequest req, HttpSession session) {
        User u = userService.authenticate(req.getEmail(), req.getPassword());

        // ✅ role 포함하여 응답
        UserResponse resp = new UserResponse(u.getId(), u.getEmail(), u.getName(), u.getRole());
        session.setAttribute(SESSION_KEY, resp);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(HttpSession session) {
        UserResponse me = (UserResponse) session.getAttribute(SESSION_KEY);
        return (me == null) ? ResponseEntity.status(401).build() : ResponseEntity.ok(me);
    }
}
