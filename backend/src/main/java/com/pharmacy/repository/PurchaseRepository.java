package com.pharmacy.repository;

import com.pharmacy.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findAllByOrderByPurchaseDateDesc();

    @Query("SELECT p FROM Purchase p WHERE p.supplier.supplierId = :supplierId ORDER BY p.purchaseDate DESC")
    List<Purchase> findBySupplierId(Long supplierId);

    boolean existsByInvoiceNumber(String invoiceNumber);
}

