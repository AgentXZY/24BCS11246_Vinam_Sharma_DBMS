package com.pharmacy.service;

import com.pharmacy.dto.MedicineDto;
import com.pharmacy.entity.Category;
import com.pharmacy.entity.Medicine;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.CategoryRepository;
import com.pharmacy.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;

    public MedicineService(MedicineRepository medicineRepository, CategoryRepository categoryRepository) {
        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<MedicineDto> getAllMedicines(String query, Long categoryId) {
        List<Medicine> medicines;
        boolean hasQuery = query != null && !query.trim().isEmpty();
        boolean hasCategory = categoryId != null;

        if (hasQuery && hasCategory) {
            medicines = medicineRepository.searchMedicinesInCategory(query.trim(), categoryId);
        } else if (hasQuery) {
            medicines = medicineRepository.searchMedicines(query.trim());
        } else if (hasCategory) {
            medicines = medicineRepository.findByCategoryCategoryId(categoryId);
        } else {
            medicines = medicineRepository.findAll();
        }

        return medicines.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicineDto getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        return toDto(medicine);
    }

    public MedicineDto createMedicine(MedicineDto dto) {
        if (dto.getSellingPrice().compareTo(dto.getPurchasePrice()) < 0) {
            throw new BadRequestException("Selling price (" + dto.getSellingPrice() + ") cannot be less than purchase price (" + dto.getPurchasePrice() + ")");
        }

        if (medicineRepository.existsByMedicineNameIgnoreCaseAndBatchNumberIgnoreCase(
                dto.getMedicineName().trim(), dto.getBatchNumber().trim())) {
            throw new BadRequestException("Medicine '" + dto.getMedicineName() + "' with batch number '" + dto.getBatchNumber() + "' already exists");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        Medicine medicine = new Medicine();
        medicine.setMedicineName(dto.getMedicineName().trim());
        medicine.setCategory(category);
        medicine.setManufacturer(dto.getManufacturer().trim());
        medicine.setBatchNumber(dto.getBatchNumber().trim());
        medicine.setPurchasePrice(dto.getPurchasePrice());
        medicine.setSellingPrice(dto.getSellingPrice());
        medicine.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0);
        medicine.setMinStockLevel(dto.getMinStockLevel() != null ? dto.getMinStockLevel() : 10);
        medicine.setExpiryDate(dto.getExpiryDate());

        return toDto(medicineRepository.save(medicine));
    }

    public MedicineDto updateMedicine(Long id, MedicineDto dto) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));

        if (dto.getSellingPrice().compareTo(dto.getPurchasePrice()) < 0) {
            throw new BadRequestException("Selling price (" + dto.getSellingPrice() + ") cannot be less than purchase price (" + dto.getPurchasePrice() + ")");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        medicine.setMedicineName(dto.getMedicineName().trim());
        medicine.setCategory(category);
        medicine.setManufacturer(dto.getManufacturer().trim());
        medicine.setBatchNumber(dto.getBatchNumber().trim());
        medicine.setPurchasePrice(dto.getPurchasePrice());
        medicine.setSellingPrice(dto.getSellingPrice());
        medicine.setMinStockLevel(dto.getMinStockLevel() != null ? dto.getMinStockLevel() : medicine.getMinStockLevel());
        medicine.setExpiryDate(dto.getExpiryDate());

        return toDto(medicineRepository.save(medicine));
    }

    public void deleteMedicine(Long id) {
        if (!medicineRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medicine not found with ID: " + id);
        }
        medicineRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<MedicineDto> getLowStockMedicines() {
        return medicineRepository.findLowStockMedicines().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineDto> getExpiredMedicines() {
        return medicineRepository.findExpiredMedicines().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineDto> getNearExpiryMedicines() {
        LocalDate threshold = LocalDate.now().plusDays(30);
        return medicineRepository.findNearExpiryMedicines(threshold).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public MedicineDto toDto(Medicine medicine) {
        MedicineDto dto = new MedicineDto();
        dto.setMedicineId(medicine.getMedicineId());
        dto.setMedicineName(medicine.getMedicineName());
        dto.setCategoryId(medicine.getCategory().getCategoryId());
        dto.setCategoryName(medicine.getCategory().getCategoryName());
        dto.setManufacturer(medicine.getManufacturer());
        dto.setBatchNumber(medicine.getBatchNumber());
        dto.setPurchasePrice(medicine.getPurchasePrice());
        dto.setSellingPrice(medicine.getSellingPrice());
        dto.setQuantity(medicine.getQuantity());
        dto.setMinStockLevel(medicine.getMinStockLevel());
        dto.setExpiryDate(medicine.getExpiryDate());
        dto.setExpired(medicine.getExpiryDate().isBefore(LocalDate.now()));
        dto.setLowStock(medicine.getQuantity() <= medicine.getMinStockLevel());
        return dto;
    }
}

