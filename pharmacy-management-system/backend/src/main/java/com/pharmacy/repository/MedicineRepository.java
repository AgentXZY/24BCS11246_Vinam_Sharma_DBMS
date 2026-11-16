package com.pharmacy.repository;

import com.pharmacy.entity.Medicine;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM Medicine m WHERE m.medicineId = :id")
    Optional<Medicine> findWithLockByMedicineId(@Param("id") Long id);

    List<Medicine> findByCategoryCategoryId(Long categoryId);

    @Query("SELECT m FROM Medicine m WHERE " +
           "LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.batchNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Medicine> searchMedicines(@Param("query") String query);

    @Query("SELECT m FROM Medicine m WHERE " +
           "m.category.categoryId = :categoryId AND (" +
           "LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.batchNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Medicine> searchMedicinesInCategory(@Param("query") String query, @Param("categoryId") Long categoryId);

    @Query("SELECT m FROM Medicine m WHERE m.quantity <= m.minStockLevel AND m.expiryDate >= CURRENT_DATE ORDER BY m.quantity ASC")
    List<Medicine> findLowStockMedicines();

    @Query("SELECT m FROM Medicine m WHERE m.expiryDate < CURRENT_DATE ORDER BY m.expiryDate ASC")
    List<Medicine> findExpiredMedicines();

    @Query("SELECT m FROM Medicine m WHERE m.expiryDate >= CURRENT_DATE AND m.expiryDate <= :thresholdDate ORDER BY m.expiryDate ASC")
    List<Medicine> findNearExpiryMedicines(@Param("thresholdDate") LocalDate thresholdDate);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.quantity <= m.minStockLevel AND m.expiryDate >= CURRENT_DATE")
    long countLowStock();

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.expiryDate < CURRENT_DATE")
    long countExpired();

    boolean existsByMedicineNameIgnoreCaseAndBatchNumberIgnoreCase(String medicineName, String batchNumber);
}

