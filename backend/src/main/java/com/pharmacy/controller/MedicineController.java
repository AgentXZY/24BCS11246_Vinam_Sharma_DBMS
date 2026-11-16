package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.MedicineDto;
import com.pharmacy.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getAllMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(ApiResponse.ok(medicineService.getAllMedicines(search, categoryId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineDto>> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(medicineService.getMedicineById(id)));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getLowStockMedicines() {
        return ResponseEntity.ok(ApiResponse.ok(medicineService.getLowStockMedicines()));
    }

    @GetMapping("/expired")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getExpiredMedicines() {
        return ResponseEntity.ok(ApiResponse.ok(medicineService.getExpiredMedicines()));
    }

    @GetMapping("/near-expiry")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getNearExpiryMedicines() {
        return ResponseEntity.ok(ApiResponse.ok(medicineService.getNearExpiryMedicines()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicineDto>> createMedicine(@Valid @RequestBody MedicineDto dto) {
        MedicineDto created = medicineService.createMedicine(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Medicine added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineDto>> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineDto dto) {
        MedicineDto updated = medicineService.updateMedicine(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Medicine updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok(ApiResponse.ok("Medicine deleted successfully", null));
    }
}

