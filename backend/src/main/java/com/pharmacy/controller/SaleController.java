package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.SaleRequestDto;
import com.pharmacy.dto.SaleResponseDto;
import com.pharmacy.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SaleResponseDto>>> getAllSales() {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getAllSales()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SaleResponseDto>> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getSaleById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SaleResponseDto>> createSale(@Valid @RequestBody SaleRequestDto dto) {
        SaleResponseDto created = saleService.createSale(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Sale created successfully and stock decreased", created));
    }
}

