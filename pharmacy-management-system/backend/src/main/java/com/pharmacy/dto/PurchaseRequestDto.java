package com.pharmacy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class PurchaseRequestDto {

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private String notes;

    @NotEmpty(message = "Purchase must contain at least one medicine item")
    @Valid
    private List<PurchaseItemRequestDto> items;

    public PurchaseRequestDto() {}

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<PurchaseItemRequestDto> getItems() { return items; }
    public void setItems(List<PurchaseItemRequestDto> items) { this.items = items; }
}

