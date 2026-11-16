package com.pharmacy.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class PurchaseResponseDto {
    private Long purchaseId;
    private String invoiceNumber;
    private Long supplierId;
    private String supplierName;
    private OffsetDateTime purchaseDate;
    private BigDecimal totalAmount;
    private String status;
    private String notes;
    private List<PurchaseItemDetailDto> items;

    public static class PurchaseItemDetailDto {
        private Long purchaseItemId;
        private Long medicineId;
        private String medicineName;
        private String batchNumber;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;

        public PurchaseItemDetailDto() {}

        public Long getPurchaseItemId() { return purchaseItemId; }
        public void setPurchaseItemId(Long purchaseItemId) { this.purchaseItemId = purchaseItemId; }

        public Long getMedicineId() { return medicineId; }
        public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

        public String getMedicineName() { return medicineName; }
        public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

        public String getBatchNumber() { return batchNumber; }
        public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

        public BigDecimal getTotalPrice() { return totalPrice; }
        public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    }

    public PurchaseResponseDto() {}

    public Long getPurchaseId() { return purchaseId; }
    public void setPurchaseId(Long purchaseId) { this.purchaseId = purchaseId; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public OffsetDateTime getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(OffsetDateTime purchaseDate) { this.purchaseDate = purchaseDate; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<PurchaseItemDetailDto> getItems() { return items; }
    public void setItems(List<PurchaseItemDetailDto> items) { this.items = items; }
}

