using System;

namespace OLAF.Domain.Customers;

public sealed class Customer
{
	private Customer(int id, string displayCaption, string? phone, string? email, string? notes, bool isActive, string updatedBy, DateTimeOffset updatedAt)
	{
		if (id <= 0) throw new ArgumentOutOfRangeException(nameof(id));
		Id = id;
		DisplayCaption = RequireCaption(displayCaption);
		Phone = phone;
		Email = email;
		Notes = notes;
		IsActive = isActive;
		UpdatedBy = RequireUpdatedBy(updatedBy);
		UpdatedAt = updatedAt;
	}

	public int Id { get; }
	public string DisplayCaption { get; }
	public string? Phone { get; }
	public string? Email { get; }
	public string? Notes { get; }
	public bool IsActive { get; }
	public string UpdatedBy { get; }
	public DateTimeOffset UpdatedAt { get; }

	public static Customer Create(int id, string displayCaption, string? phone, string? email, string? notes, string updatedBy, DateTimeOffset updatedAt)
	{
		return new Customer(id, displayCaption, phone, email, notes, true, updatedBy, updatedAt);
	}

	public Customer Update(string displayCaption, string? phone, string? email, string? notes, string updatedBy, DateTimeOffset updatedAt)
	{
		if (DisplayCaption == displayCaption && Phone == phone && Email == email && Notes == notes)
		{
			return this;
		}

		return new Customer(Id, displayCaption, phone, email, notes, IsActive, updatedBy, updatedAt);
	}

	public Customer SetActive(bool isActive, string updatedBy, DateTimeOffset updatedAt)
	{
		return IsActive == isActive
			? this
			: new Customer(Id, DisplayCaption, Phone, Email, Notes, isActive, updatedBy, updatedAt);
	}

	private static string RequireCaption(string value)
	{
		if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("A customer display caption is required.", nameof(value));
		return value;
	}

	private static string RequireUpdatedBy(string value)
	{
		if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("The user performing the change is required.", nameof(value));
		return value;
	}
}
