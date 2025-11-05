package com.hk.hos.service;

import com.hk.hos.entity.User;
import com.hk.hos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public void signup(String email, String name, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("이미 가입된 이메일입니다.");
        }
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(password);
        userRepository.save(user);
    }

    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 이메일입니다."));
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        return user;
    }
}
