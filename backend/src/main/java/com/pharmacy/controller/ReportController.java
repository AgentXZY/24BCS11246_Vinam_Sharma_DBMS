package com.pharmacy.controller;

import com.pharmacy.dto.ApiResponse;
import com.pharmacy.dto.BestSellerDto;
import com.pharmacy.dto.DashboardStatsDto;
import com.pharmacy.dto.MonthlyReportDto;
import com.pharmacy.entity.StockTransaction;
import com.pharmacy.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getDashboardStats()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<MonthlyReportDto>>> getMonthlySalesReport(
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getMonthlySalesReport(year)));
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<ApiResponse<List<BestSellerDto>>> getBestSellingMedicines(
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getBestSellingMedicines(limit)));
    }

    @GetMapping("/daily-sales")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDailySalesSummary() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getDailySalesSummary()));
    }

    @GetMapping("/inventory-summary")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getInventorySummary() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getInventorySummary()));
    }

    @GetMapping("/stock-transactions")
    public ResponseEntity<ApiResponse<List<StockTransaction>>> getStockTransactions() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getRecentStockTransactions()));
    }
}

