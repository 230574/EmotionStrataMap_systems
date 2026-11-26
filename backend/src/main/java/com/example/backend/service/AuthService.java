package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

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
        return userRepository.findByEmail(normalizeEmail(email)).orElse(null);
    }

    @Transactional
    public User register(String displayName, String email, String rawPassword, boolean termsAgreed) {
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("ユーザー名を入力してください");
        }
        if (displayName.length() > 20) {
            throw new IllegalArgumentException("ユーザー名は20文字以内で入力してください");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("メールアドレスを入力してください");
        }

        String normalizedEmail = normalizeEmail(email);
        if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            throw new IllegalArgumentException("メールアドレスの形式が正しくありません");
        }
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("パスワードを入力してください");
        }
        if (rawPassword.length() < 8) {
            throw new IllegalArgumentException("パスワードは8文字以上で入力してください");
        }
        if (!termsAgreed) {
            throw new IllegalArgumentException("利用規約への同意が必要です");
        }
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("このメールアドレスは登録済みです");
        }

        String username = normalizedEmail;
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("このメールアドレスは登録済みです");
        }

        User user = new User();
        user.setUsername(username);
        user.setNickname(displayName);
        user.setEmail(normalizedEmail);
        user.setTermsAgreed(true);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole("USER");
        user.setDeleted(false);
        return userRepository.save(user);
    }

    @Transactional
    public User register(String username, String rawPassword, String nickname) {
        String syntheticEmail = normalizeEmail(username + "@example.local");
        User user = register(nickname == null || nickname.isBlank() ? username : nickname,
                syntheticEmail, rawPassword, true);
        user.setUsername(username);
        return userRepository.save(user);
    }

    @Transactional
    public User register(String username, String rawPassword) {
        return register(username, rawPassword, username);
    }

    public User login(String email, String rawPassword) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("メールアドレスを入力してください");
        }
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("パスワードを入力してください");
        }

        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .or(() -> userRepository.findByUsername(normalizedEmail))
                .orElseThrow(() -> new IllegalArgumentException("メールアドレスまたはパスワードが正しくありません"));

        if (user.isDeleted()) {
            throw new IllegalArgumentException("このアカウントは利用停止されています");
        }
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("メールアドレスまたはパスワードが正しくありません");
        }
        return user;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
