package com.pharmacy.repository;

import com.pharmacy.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findAllByOrderBySaleDateDesc();

    List<Sale> findByCustomerCustomerIdOrderBySaleDateDesc(Long customerId);

    @Query("SELECT COALESCE(SUM(s.netAmount), 0.00) FROM Sale s WHERE s.status = 'COMPLETED'")
    BigDecimal sumTotalRevenue();

    boolean existsByInvoiceNumber(String invoiceNumber);
}

