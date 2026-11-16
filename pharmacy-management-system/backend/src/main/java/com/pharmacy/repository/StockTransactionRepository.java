package com.pharmacy.repository;

import com.pharmacy.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findTop50ByOrderByTransactionDateDesc();
    List<StockTransaction> findByMedicineMedicineIdOrderByTransactionDateDesc(Long medicineId);
}

