package com.pharmacy.service;

import com.pharmacy.dto.SupplierDto;
import com.pharmacy.entity.Supplier;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Transactional(readOnly = true)
    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
        return toDto(supplier);
    }

    @Transactional(readOnly = true)
    public List<SupplierDto> searchSuppliers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllSuppliers();
        }
        return supplierRepository.searchSuppliers(query.trim()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SupplierDto createSupplier(SupplierDto dto) {
        if (supplierRepository.existsByEmailIgnoreCase(dto.getEmail().trim())) {
            throw new BadRequestException("Supplier with email '" + dto.getEmail() + "' already exists");
        }
        Supplier supplier = new Supplier();
        supplier.setSupplierName(dto.getSupplierName().trim());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setPhone(dto.getPhone().trim());
        supplier.setEmail(dto.getEmail().trim().toLowerCase());
        supplier.setAddress(dto.getAddress());
        return toDto(supplierRepository.save(supplier));
    }

    public SupplierDto updateSupplier(Long id, SupplierDto dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));

        if (!supplier.getEmail().equalsIgnoreCase(dto.getEmail().trim()) &&
                supplierRepository.existsByEmailIgnoreCase(dto.getEmail().trim())) {
            throw new BadRequestException("Supplier with email '" + dto.getEmail() + "' already exists");
        }

        supplier.setSupplierName(dto.getSupplierName().trim());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setPhone(dto.getPhone().trim());
        supplier.setEmail(dto.getEmail().trim().toLowerCase());
        supplier.setAddress(dto.getAddress());
        return toDto(supplierRepository.save(supplier));
    }

    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found with ID: " + id);
        }
        supplierRepository.deleteById(id);
    }

    public SupplierDto toDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setSupplierId(supplier.getSupplierId());
        dto.setSupplierName(supplier.getSupplierName());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setPhone(supplier.getPhone());
        dto.setEmail(supplier.getEmail());
        dto.setAddress(supplier.getAddress());
        return dto;
    }
}

