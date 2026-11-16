package com.pharmacy.service;

import com.pharmacy.dto.PurchaseItemRequestDto;
import com.pharmacy.dto.PurchaseRequestDto;
import com.pharmacy.dto.PurchaseResponseDto;
import com.pharmacy.entity.Medicine;
import com.pharmacy.entity.Purchase;
import com.pharmacy.entity.PurchaseItem;
import com.pharmacy.entity.Supplier;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.MedicineRepository;
import com.pharmacy.repository.PurchaseRepository;
import com.pharmacy.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           SupplierRepository supplierRepository,
                           MedicineRepository medicineRepository) {
        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.medicineRepository = medicineRepository;
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponseDto> getAllPurchases() {
        return purchaseRepository.findAllByOrderByPurchaseDateDesc().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseResponseDto getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with ID: " + id));
        return toResponseDto(purchase);
    }

    public PurchaseResponseDto createPurchase(PurchaseRequestDto dto) {
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BadRequestException("Purchase must contain at least one item");
        }

        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + dto.getSupplierId()));

        Purchase purchase = new Purchase();
        purchase.setSupplier(supplier);
        purchase.setInvoiceNumber("PUR-" + System.currentTimeMillis() % 100000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        purchase.setPurchaseDate(OffsetDateTime.now());
        purchase.setStatus("COMPLETED");
        purchase.setNotes(dto.getNotes());

        BigDecimal calculatedTotal = BigDecimal.ZERO;

        for (PurchaseItemRequestDto itemDto : dto.getItems()) {
            Medicine medicine = medicineRepository.findById(itemDto.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + itemDto.getMedicineId()));

            PurchaseItem item = new PurchaseItem();
            item.setMedicine(medicine);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());
            BigDecimal itemTotal = itemDto.getUnitPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            item.setTotalPrice(itemTotal);

            calculatedTotal = calculatedTotal.add(itemTotal);
            purchase.addItem(item);
        }

        purchase.setTotalAmount(calculatedTotal);

        // Saving purchase cascades to purchase_items.
        // PostgreSQL trigger 'trg_after_purchase_item_insert' automatically:
        // 1. Updates medicine quantity
        // 2. Logs audit trail in stock_transactions
        Purchase saved = purchaseRepository.saveAndFlush(purchase);

        return toResponseDto(saved);
    }

    public PurchaseResponseDto toResponseDto(Purchase purchase) {
        PurchaseResponseDto dto = new PurchaseResponseDto();
        dto.setPurchaseId(purchase.getPurchaseId());
        dto.setInvoiceNumber(purchase.getInvoiceNumber());
        dto.setSupplierId(purchase.getSupplier().getSupplierId());
        dto.setSupplierName(purchase.getSupplier().getSupplierName());
        dto.setPurchaseDate(purchase.getPurchaseDate());
        dto.setTotalAmount(purchase.getTotalAmount());
        dto.setStatus(purchase.getStatus());
        dto.setNotes(purchase.getNotes());

        List<PurchaseResponseDto.PurchaseItemDetailDto> itemDtos = purchase.getItems().stream().map(item -> {
            PurchaseResponseDto.PurchaseItemDetailDto idto = new PurchaseResponseDto.PurchaseItemDetailDto();
            idto.setPurchaseItemId(item.getPurchaseItemId());
            idto.setMedicineId(item.getMedicine().getMedicineId());
            idto.setMedicineName(item.getMedicine().getMedicineName());
            idto.setBatchNumber(item.getMedicine().getBatchNumber());
            idto.setQuantity(item.getQuantity());
            idto.setUnitPrice(item.getUnitPrice());
            idto.setTotalPrice(item.getTotalPrice());
            return idto;
        }).collect(Collectors.toList());

        dto.setItems(itemDtos);
        return dto;
    }
}

