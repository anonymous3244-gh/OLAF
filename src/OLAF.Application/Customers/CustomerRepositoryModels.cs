using System;

namespace OLAF.Application.Customers;

public sealed record NewCustomerRecord(string DisplayCaption, string? Phone, string? Email, string? Notes, string UpdatedBy, DateTimeOffset UpdatedAt);
public sealed record CustomerUpdateRecord(string DisplayCaption, string? Phone, string? Email, string? Notes, string UpdatedBy, DateTimeOffset UpdatedAt);
