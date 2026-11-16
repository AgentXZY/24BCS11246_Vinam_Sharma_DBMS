package com.pharmacy.service;

import com.pharmacy.dto.CustomerDto;
import com.pharmacy.entity.Customer;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return toDto(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerDto> searchCustomers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCustomers();
        }
        return customerRepository.searchCustomers(query.trim()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CustomerDto createCustomer(CustomerDto dto) {
        Customer customer = new Customer();
        customer.setCustomerName(dto.getCustomerName().trim());
        customer.setPhone(dto.getPhone().trim());
        customer.setEmail(dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : null);
        customer.setAddress(dto.getAddress());
        return toDto(customerRepository.save(customer));
    }

    public CustomerDto updateCustomer(Long id, CustomerDto dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        customer.setCustomerName(dto.getCustomerName().trim());
        customer.setPhone(dto.getPhone().trim());
        customer.setEmail(dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : null);
        customer.setAddress(dto.getAddress());
        return toDto(customerRepository.save(customer));
    }

    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + id);
        }
        customerRepository.deleteById(id);
    }

    public CustomerDto toDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setCustomerId(customer.getCustomerId());
        dto.setCustomerName(customer.getCustomerName());
        dto.setPhone(customer.getPhone());
        dto.setEmail(customer.getEmail());
        dto.setAddress(customer.getAddress());
        return dto;
    }
}

