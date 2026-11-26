package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public User findByEmail(String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElse(null);
    }

    @Transactional
    public User register(String username, String rawPassword, String nickname) {
        if (username == null || !username.matches("^[A-Za-z0-9]{4,20}$")) {
            throw new IllegalArgumentException("ユーザー名は半角英数字4〜20文字で入力してください");
        }
        if (rawPassword == null || rawPassword.length() < 8) {
            throw new IllegalArgumentException("パスワードは8文字以上で入力してください");
        }
        if (nickname == null || nickname.isBlank()) {
            nickname = username;
        }
        if (nickname.length() > 20) {
            throw new IllegalArgumentException("ニックネームは20文字以内で入力してください");
        }
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("このユーザー名は登録済みです");
        }

        User user = new User();
        user.setUsername(username);
        user.setNickname(nickname);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole("USER");
        user.setDeleted(false);
        user.setSuspended(false);
        user.setTermsAgreed(true);
        return userRepository.save(user);
    }

    @Transactional
    public User register(String username, String rawPassword) {
        return register(username, rawPassword, username);
    }

    public User login(String username, String rawPassword) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("ユーザー名を入力してください");
        }
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("パスワードを入力してください");
        }

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || user.isDeleted()) {
            throw new IllegalArgumentException("ユーザー名またはパスワードが正しくありません");
        }
        if (user.isSuspended()) {
            throw new IllegalArgumentException("このアカウントは利用できません。");
        }
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("ユーザー名またはパスワードが正しくありません");
        }
        return user;
    }

    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        return findByUsername(authentication.getName());
    }
}
