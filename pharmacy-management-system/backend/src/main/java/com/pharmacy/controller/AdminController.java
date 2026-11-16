package com.pharmacy.controller;

import com.pharmacy.dto.AdminDto;
import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.LoginRequestDto;
import com.pharmacy.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminDto>> login(@Valid @RequestBody LoginRequestDto request) {
        AdminDto admin = adminService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", admin));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminDto>>> getAllAdmins() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllAdmins()));
    }
}

