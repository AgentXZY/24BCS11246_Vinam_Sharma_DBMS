package com.pharmacy.service;

import com.pharmacy.dto.AdminDto;
import com.pharmacy.dto.LoginRequestDto;
import com.pharmacy.entity.Admin;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.repository.AdminRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public AdminDto login(LoginRequestDto request) {
        Admin admin = adminRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        // Direct matching for demo simplicity
        if (!admin.getPasswordHash().equals(request.getPassword())) {
            throw new BadRequestException("Invalid username or password");
        }

        return toDto(admin);
    }

    public List<AdminDto> getAllAdmins() {
        return adminRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    private AdminDto toDto(Admin admin) {
        return new AdminDto(admin.getAdminId(), admin.getUsername(), admin.getFullName(), admin.getEmail(), admin.getRole());
    }
}

