using System;

namespace OLAF.Domain.Customers;

public sealed class Customer
{
	private Customer(
		int id,
		string displayCaption,
		string? phone,
		string? email,
		string? notes,
		bool isActive,
		string updatedBy,
		DateTimeOffset updatedAt)
	{
		if (id <= 0)
		{
			throw new ArgumentOutOfRangeException(nameof(id));
		}

		Id = id;
		DisplayCaption = RequireCaption(displayCaption);
		Phone = phone;
		Email = email;
		Notes = notes;
		IsActive = isActive;
		UpdatedBy = RequireUpdatedBy(updatedBy);
		UpdatedAt = updatedAt;
	}

	public int Id { get; private set; }

	public string DisplayCaption { get; private set; }

	public string? Phone { get; private set; }

	public string? Email { get; private set; }

	public string? Notes { get; private set; }

	public bool IsActive { get; private set; }

	public string UpdatedBy { get; private set; }

	public DateTimeOffset UpdatedAt { get; private set; }

	public static Customer Create(
		int id,
		string displayCaption,
		string? phone,
		string? email,
		string? notes,
		string updatedBy,
		DateTimeOffset updatedAt)
	{
		return new Customer(
			id,
			displayCaption,
			phone,
			email,
			notes,
			true,
			updatedBy,
			updatedAt);
	}

	public void Update(
		string displayCaption,
		string? phone,
		string? email,
		string? notes,
		string updatedBy,
		DateTimeOffset updatedAt)
	{
		DisplayCaption = RequireCaption(displayCaption);
		Phone = phone;
		Email = email;
		Notes = notes;
		RecordUpdate(updatedBy, updatedAt);
	}

	public void SetActive(bool isActive, string updatedBy, DateTimeOffset updatedAt)
	{
		if (IsActive == isActive)
		{
			return;
		}

		IsActive = isActive;
		RecordUpdate(updatedBy, updatedAt);
	}

	private void RecordUpdate(string updatedBy, DateTimeOffset updatedAt)
	{
		UpdatedBy = RequireUpdatedBy(updatedBy);
		UpdatedAt = updatedAt;
	}

	private static string RequireCaption(string displayCaption)
	{
		if (string.IsNullOrWhiteSpace(displayCaption))
		{
			throw new ArgumentException("A customer display caption is required.", nameof(displayCaption));
		}

		return displayCaption;
	}

	private static string RequireUpdatedBy(string updatedBy)
	{
		if (string.IsNullOrWhiteSpace(updatedBy))
		{
			throw new ArgumentException("The user performing the change is required.", nameof(updatedBy));
		}

		return updatedBy;
	}
}
