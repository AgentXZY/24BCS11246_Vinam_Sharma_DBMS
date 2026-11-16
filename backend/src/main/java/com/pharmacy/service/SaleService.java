package com.pharmacy.service;

import com.pharmacy.dto.SaleItemRequestDto;
import com.pharmacy.dto.SaleRequestDto;
import com.pharmacy.dto.SaleResponseDto;
import com.pharmacy.entity.Customer;
import com.pharmacy.entity.Medicine;
import com.pharmacy.entity.Sale;
import com.pharmacy.entity.SaleItem;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.CustomerRepository;
import com.pharmacy.repository.MedicineRepository;
import com.pharmacy.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final MedicineRepository medicineRepository;

    public SaleService(SaleRepository saleRepository,
                       CustomerRepository customerRepository,
                       MedicineRepository medicineRepository) {
        this.saleRepository = saleRepository;
        this.customerRepository = customerRepository;
        this.medicineRepository = medicineRepository;
    }

    @Transactional(readOnly = true)
    public List<SaleResponseDto> getAllSales() {
        return saleRepository.findAllByOrderBySaleDateDesc().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SaleResponseDto getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with ID: " + id));
        return toResponseDto(sale);
    }

    @Transactional(readOnly = true)
    public List<SaleResponseDto> getSalesByCustomerId(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + customerId);
        }
        return saleRepository.findByCustomerCustomerIdOrderBySaleDateDesc(customerId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public SaleResponseDto createSale(SaleRequestDto dto) {
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BadRequestException("Sale must contain at least one medicine item");
        }

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

        Sale sale = new Sale();
        sale.setCustomer(customer);
        sale.setInvoiceNumber("INV-" + System.currentTimeMillis() % 100000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        sale.setSaleDate(OffsetDateTime.now());
        sale.setPaymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod().toUpperCase() : "CASH");
        sale.setDiscountAmount(dto.getDiscountAmount() != null ? dto.getDiscountAmount() : BigDecimal.ZERO);
        sale.setStatus("COMPLETED");

        BigDecimal grossTotal = BigDecimal.ZERO;

        for (SaleItemRequestDto itemDto : dto.getItems()) {
            // Concurrency-safe row-level lock on the medicine to prevent race conditions & overselling
            Medicine medicine = medicineRepository.findWithLockByMedicineId(itemDto.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + itemDto.getMedicineId()));

            // 1. Expiry check
            if (medicine.getExpiryDate().isBefore(LocalDate.now())) {
                throw new BadRequestException("Cannot sell expired medicine: " + medicine.getMedicineName() +
                        " (expired on " + medicine.getExpiryDate() + ")");
            }

            // 2. Stock check
            if (medicine.getQuantity() < itemDto.getQuantity()) {
                throw new BadRequestException("Insufficient stock for medicine " + medicine.getMedicineName() +
                        ": requested " + itemDto.getQuantity() + ", available " + medicine.getQuantity());
            }

            BigDecimal unitPrice = itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : medicine.getSellingPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemDto.getQuantity()));

            SaleItem item = new SaleItem();
            item.setMedicine(medicine);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(unitPrice);
            item.setTotalPrice(itemTotal);

            grossTotal = grossTotal.add(itemTotal);
            sale.addItem(item);
        }

        sale.setTotalAmount(grossTotal);
        BigDecimal netAmount = grossTotal.subtract(sale.getDiscountAmount());
        if (netAmount.compareTo(BigDecimal.ZERO) < 0) {
            netAmount = BigDecimal.ZERO;
        }
        sale.setNetAmount(netAmount);

        // Saving sale cascades to sale_items.
        // PostgreSQL trigger 'trg_before_sale_item_insert' validates stock, deducts inventory,
        // and logs stock_transactions audit trail.
        // If an exception occurs, the entire transaction rolls back cleanly.
        Sale saved = saleRepository.saveAndFlush(sale);

        return toResponseDto(saved);
    }

    public SaleResponseDto toResponseDto(Sale sale) {
        SaleResponseDto dto = new SaleResponseDto();
        dto.setSaleId(sale.getSaleId());
        dto.setInvoiceNumber(sale.getInvoiceNumber());
        dto.setCustomerId(sale.getCustomer().getCustomerId());
        dto.setCustomerName(sale.getCustomer().getCustomerName());
        dto.setCustomerPhone(sale.getCustomer().getPhone());
        dto.setSaleDate(sale.getSaleDate());
        dto.setTotalAmount(sale.getTotalAmount());
        dto.setDiscountAmount(sale.getDiscountAmount());
        dto.setNetAmount(sale.getNetAmount());
        dto.setPaymentMethod(sale.getPaymentMethod());
        dto.setStatus(sale.getStatus());

        List<SaleResponseDto.SaleItemDetailDto> itemDtos = sale.getItems().stream().map(item -> {
            SaleResponseDto.SaleItemDetailDto idto = new SaleResponseDto.SaleItemDetailDto();
            idto.setSaleItemId(item.getSaleItemId());
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

