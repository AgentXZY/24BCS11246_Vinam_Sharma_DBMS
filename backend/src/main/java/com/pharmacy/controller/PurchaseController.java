package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.PurchaseRequestDto;
import com.pharmacy.dto.PurchaseResponseDto;
import com.pharmacy.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseResponseDto>>> getAllPurchases() {
        return ResponseEntity.ok(ApiResponse.ok(purchaseService.getAllPurchases()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseResponseDto>> getPurchaseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseService.getPurchaseById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseResponseDto>> createPurchase(@Valid @RequestBody PurchaseRequestDto dto) {
        PurchaseResponseDto created = purchaseService.createPurchase(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Purchase created successfully and stock updated", created));
    }
}

