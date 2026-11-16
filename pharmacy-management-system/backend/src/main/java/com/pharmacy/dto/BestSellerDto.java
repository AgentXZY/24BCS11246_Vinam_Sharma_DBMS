package com.pharmacy.dto;

import java.math.BigDecimal;

public class BestSellerDto {
    private Long medicineId;
    private String medicineName;
    private String categoryName;
    private long totalSold;
    private BigDecimal totalRevenue;

    public BestSellerDto() {}

    public BestSellerDto(Long medicineId, String medicineName, String categoryName, long totalSold, BigDecimal totalRevenue) {
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.categoryName = categoryName;
        this.totalSold = totalSold;
        this.totalRevenue = totalRevenue;
    }

    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public long getTotalSold() { return totalSold; }
    public void setTotalSold(long totalSold) { this.totalSold = totalSold; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
}

