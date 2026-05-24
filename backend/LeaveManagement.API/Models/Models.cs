namespace LeaveManagement.API.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Employee"; // Employee, Manager, HRAdmin
    public string Department { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int? ManagerId { get; set; }
    public User? Manager { get; set; }
    public ICollection<User> Reportees { get; set; } = new List<User>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
}

public class LeaveType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;        // Annual, Sick, Casual, Maternity
    public string Code { get; set; } = string.Empty;        // AL, SL, CL, ML
    public int DefaultDays { get; set; }
    public bool CarryForward { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
}

public class LeaveBalance
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int LeaveTypeId { get; set; }
    public LeaveType LeaveType { get; set; } = null!;
    public int Year { get; set; }
    public decimal TotalDays { get; set; }
    public decimal UsedDays { get; set; }
    public decimal PendingDays { get; set; }
    public decimal AvailableDays => TotalDays - UsedDays - PendingDays;
}

public class LeaveRequest
{
    public int Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int LeaveTypeId { get; set; }
    public LeaveType LeaveType { get; set; } = null!;
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public decimal TotalDays { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool IsHalfDay { get; set; } = false;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Cancelled
    public string? ManagerComment { get; set; }
    public int? ApprovedByManagerId { get; set; }
    public User? ApprovedByManager { get; set; }
    public DateTime? ActionDate { get; set; }
    public DateTime AppliedOn { get; set; } = DateTime.UtcNow;
    public ICollection<LeaveAuditLog> AuditLogs { get; set; } = new List<LeaveAuditLog>();
}

public class LeaveAuditLog
{
    public int Id { get; set; }
    public int LeaveRequestId { get; set; }
    public LeaveRequest LeaveRequest { get; set; } = null!;
    public string Action { get; set; } = string.Empty;     // Applied, Approved, Rejected, Cancelled
    public string PerformedBy { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class Holiday
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int Year { get; set; }
}
