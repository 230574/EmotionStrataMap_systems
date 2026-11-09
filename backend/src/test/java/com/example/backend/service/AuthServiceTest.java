package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(AuthService.class)
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void register_shouldCreateUserWithHashedPassword() {
        User user = authService.register("alice", "password123");

        assertThat(user.getId()).isNotNull();
        assertThat(user.getUsername()).isEqualTo("alice");
        assertThat(user.getPasswordHash()).isNotEqualTo("password123");
        assertThat(userRepository.findByUsername("alice")).isPresent();
    }

    @Test
    void login_shouldAuthenticateValidUser() {
        authService.register("bob", "secret456");

        User loginUser = authService.login("bob", "secret456");
        assertThat(loginUser).isNotNull();
        assertThat(loginUser.getUsername()).isEqualTo("bob");
    }
}
