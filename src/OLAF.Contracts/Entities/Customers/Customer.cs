using System;

namespace OLAF.Contracts.Entities.Customers;

public sealed class Customer
{
	public Customer(int id, string displayCaption, string? phone, string? email, string? notes, string updatedBy, DateTimeOffset updatedAt, bool isActive = true)
	{
		if (id <= 0) throw new ArgumentOutOfRangeException(nameof(id));
		Id = id;
		DisplayCaption = RequireCaption(displayCaption);
		Phone = phone;
		Email = email;
		Notes = notes;
		UpdatedBy = RequireUpdatedBy(updatedBy);
		UpdatedAt = updatedAt;
		IsActive = isActive;
	}

	public int Id { get; }
	public string DisplayCaption { get; }
	public string? Phone { get; }
	public string? Email { get; }
	public string? Notes { get; }
	public string UpdatedBy { get; }
	public DateTimeOffset UpdatedAt { get; }
	public bool IsActive { get; }

	public Customer Update(string displayCaption, string? phone, string? email, string? notes, string updatedBy, DateTimeOffset updatedAt)
		=> IsNotChanged(displayCaption, phone, email, notes)
			? this
			: new Customer(Id, displayCaption, phone, email, notes, updatedBy, updatedAt, IsActive);

	private bool IsNotChanged(string displayCaption, string? phone, string? email, string? notes)
		=> DisplayCaption == displayCaption && Phone == phone && Email == email && Notes == notes;

	public Customer SetActive(bool isActive, string updatedBy, DateTimeOffset updatedAt)
		=> IsActive == isActive
			? this
			: new Customer(Id, DisplayCaption, Phone, Email, Notes, updatedBy, updatedAt, isActive);

	private static string RequireCaption(string value)
		=> string.IsNullOrWhiteSpace(value)
			? throw new ArgumentException("A customer display caption is required.", nameof(value))
			: value;

	private static string RequireUpdatedBy(string value)
		=> string.IsNullOrWhiteSpace(value)
			? throw new ArgumentException("The user performing the change is required.", nameof(value))
			: value;
}
