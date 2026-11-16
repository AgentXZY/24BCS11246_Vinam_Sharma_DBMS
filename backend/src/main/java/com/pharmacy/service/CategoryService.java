package com.pharmacy.service;

import com.pharmacy.dto.CategoryDto;
import com.pharmacy.entity.Category;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        return toDto(category);
    }

    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsByCategoryNameIgnoreCase(dto.getCategoryName().trim())) {
            throw new BadRequestException("Category with name '" + dto.getCategoryName() + "' already exists");
        }
        Category category = new Category();
        category.setCategoryName(dto.getCategoryName().trim());
        category.setDescription(dto.getDescription());
        return toDto(categoryRepository.save(category));
    }

    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        if (!category.getCategoryName().equalsIgnoreCase(dto.getCategoryName().trim()) &&
                categoryRepository.existsByCategoryNameIgnoreCase(dto.getCategoryName().trim())) {
            throw new BadRequestException("Another category with name '" + dto.getCategoryName() + "' already exists");
        }

        category.setCategoryName(dto.getCategoryName().trim());
        category.setDescription(dto.getDescription());
        return toDto(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryDto toDto(Category category) {
        return new CategoryDto(category.getCategoryId(), category.getCategoryName(), category.getDescription());
    }
}

