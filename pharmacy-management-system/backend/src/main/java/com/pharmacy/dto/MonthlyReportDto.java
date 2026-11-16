package com.pharmacy.dto;

import java.math.BigDecimal;

public class MonthlyReportDto {
    private int monthNumber;
    private String monthName;
    private long totalOrders;
    private BigDecimal grossSales;
    private BigDecimal totalDiscount;
    private BigDecimal netRevenue;

    public MonthlyReportDto() {}

    public MonthlyReportDto(int monthNumber, String monthName, long totalOrders, BigDecimal grossSales, BigDecimal totalDiscount, BigDecimal netRevenue) {
        this.monthNumber = monthNumber;
        this.monthName = monthName;
        this.totalOrders = totalOrders;
        this.grossSales = grossSales;
        this.totalDiscount = totalDiscount;
        this.netRevenue = netRevenue;
    }

    public int getMonthNumber() { return monthNumber; }
    public void setMonthNumber(int monthNumber) { this.monthNumber = monthNumber; }

    public String getMonthName() { return monthName; }
    public void setMonthName(String monthName) { this.monthName = monthName; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getGrossSales() { return grossSales; }
    public void setGrossSales(BigDecimal grossSales) { this.grossSales = grossSales; }

    public BigDecimal getTotalDiscount() { return totalDiscount; }
    public void setTotalDiscount(BigDecimal totalDiscount) { this.totalDiscount = totalDiscount; }

    public BigDecimal getNetRevenue() { return netRevenue; }
    public void setNetRevenue(BigDecimal netRevenue) { this.netRevenue = netRevenue; }
}

