package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(UserAdminService.class)
class UserAdminServiceTest {

    @Autowired
    private UserAdminService userAdminService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void suspendUser_shouldMarkDeleted() {
        User user = new User();
        user.setUsername("admin-test");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user = userRepository.save(user);

        userAdminService.deactivateUser(user.getId());

        User updated = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updated.isDeleted()).isTrue();
    }
}
