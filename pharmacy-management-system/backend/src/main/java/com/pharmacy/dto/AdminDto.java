package com.pharmacy.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminDto {
    private Long adminId;
    private String username;
    private String fullName;
    private String email;
    private String role;

    public AdminDto() {}

    public AdminDto(Long adminId, String username, String fullName, String email, String role) {
        this.adminId = adminId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

