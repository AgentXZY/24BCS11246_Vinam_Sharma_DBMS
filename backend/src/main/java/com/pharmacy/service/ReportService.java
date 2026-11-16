package com.pharmacy.service;

import com.pharmacy.dto.BestSellerDto;
import com.pharmacy.dto.DashboardStatsDto;
import com.pharmacy.dto.MonthlyReportDto;
import com.pharmacy.entity.StockTransaction;
import com.pharmacy.repository.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final JdbcTemplate jdbcTemplate;
    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final PurchaseRepository purchaseRepository;
    private final SaleRepository saleRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public ReportService(JdbcTemplate jdbcTemplate,
                         MedicineRepository medicineRepository,
                         CategoryRepository categoryRepository,
                         SupplierRepository supplierRepository,
                         CustomerRepository customerRepository,
                         PurchaseRepository purchaseRepository,
                         SaleRepository saleRepository,
                         StockTransactionRepository stockTransactionRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.customerRepository = customerRepository;
        this.purchaseRepository = purchaseRepository;
        this.saleRepository = saleRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalMedicines(medicineRepository.count());
        stats.setTotalCategories(categoryRepository.count());
        stats.setTotalSuppliers(supplierRepository.count());
        stats.setTotalCustomers(customerRepository.count());
        stats.setTotalPurchases(purchaseRepository.count());
        stats.setTotalSales(saleRepository.count());
        stats.setTotalRevenue(saleRepository.sumTotalRevenue());
        stats.setLowStockCount(medicineRepository.countLowStock());
        stats.setExpiredCount(medicineRepository.countExpired());
        return stats;
    }

    /**
     * Executes PostgreSQL stored function: get_monthly_sales_report(p_year)
     */
    public List<MonthlyReportDto> getMonthlySalesReport(Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        String sql = "SELECT * FROM get_monthly_sales_report(?)";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new MonthlyReportDto(
                rs.getInt("month_number"),
                rs.getString("month_name").trim(),
                rs.getLong("total_orders"),
                rs.getBigDecimal("gross_sales"),
                rs.getBigDecimal("total_discount"),
                rs.getBigDecimal("net_revenue")
        ), targetYear);
    }

    /**
     * Executes PostgreSQL stored function: get_best_selling_medicines(p_limit)
     */
    public List<BestSellerDto> getBestSellingMedicines(Integer limit) {
        int targetLimit = (limit != null && limit > 0) ? limit : 10;
        String sql = "SELECT * FROM get_best_selling_medicines(?)";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new BestSellerDto(
                rs.getLong("medicine_id"),
                rs.getString("medicine_name"),
                rs.getString("category_name"),
                rs.getLong("total_quantity_sold"),
                rs.getBigDecimal("total_revenue_generated")
        ), targetLimit);
    }

    /**
     * Queries PostgreSQL View: sales_summary
     */
    public List<Map<String, Object>> getDailySalesSummary() {
        String sql = "SELECT * FROM sales_summary LIMIT 30";
        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Queries PostgreSQL View: medicine_inventory_summary
     */
    public List<Map<String, Object>> getInventorySummary() {
        String sql = "SELECT * FROM medicine_inventory_summary";
        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Retrieves audit trail of stock transactions
     */
    public List<StockTransaction> getRecentStockTransactions() {
        return stockTransactionRepository.findTop50ByOrderByTransactionDateDesc();
    }
}

