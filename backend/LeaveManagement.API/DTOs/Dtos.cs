namespace LeaveManagement.API.DTOs;

// Auth
public record LoginDto(string Email, string Password);
public record RegisterDto(string Name, string Email, string Password, string Department, string EmployeeCode, int? ManagerId);
public record AuthResponseDto(string Token, int UserId, string Name, string Email, string Role, string Department);

// User
public record UserDto(int Id, string Name, string Email, string Role, string Department, string EmployeeCode, DateTime JoiningDate, int? ManagerId, string? ManagerName, bool IsActive);
public record UpdateUserDto(string Name, string Department, int? ManagerId, bool IsActive, string Role);
public record ChangePasswordDto(string CurrentPassword, string NewPassword);

// HR Onboarding
public record AddEmployeeDto(string Name, string Email, string Department, string EmployeeCode, string Role, int? ManagerId, DateTime JoiningDate);
public record AddEmployeeResponseDto(int Id, string Name, string Email, string Role, string Department, string EmployeeCode, string TempPassword);

// Leave Type
public record LeaveTypeDto(int Id, string Name, string Code, int DefaultDays, bool CarryForward);

// Leave Balance
public record LeaveBalanceDto(int LeaveTypeId, string LeaveTypeName, string Code, decimal TotalDays, decimal UsedDays, decimal PendingDays, decimal AvailableDays);

// Leave Request
public record ApplyLeaveDto(int LeaveTypeId, DateTime FromDate, DateTime ToDate, string Reason, bool IsHalfDay = false);

public record LeaveRequestDto(
    int Id, string RequestNumber, string EmployeeName, string EmployeeCode,
    string Department, string LeaveTypeName, string LeaveTypeCode,
    DateTime FromDate, DateTime ToDate, decimal TotalDays,
    string Reason, string Status, string? ManagerComment,
    string? ApprovedByManager, DateTime? ActionDate, DateTime AppliedOn,
    bool IsHalfDay,
    List<AuditLogDto> AuditLogs
);

public record AuditLogDto(string Action, string PerformedBy, string? Comment, DateTime Timestamp);
public record ActionLeaveDto(string Action, string? Comment);

// Dashboard
public record EmployeeDashboardDto(
    string EmployeeName, string Department, string ManagerName,
    List<LeaveBalanceDto> Balances,
    List<LeaveRequestDto> RecentRequests,
    List<HolidayDto> UpcomingHolidays
);

public record ManagerDashboardDto(
    int TotalReportees, int PendingApprovals,
    List<LeaveRequestDto> PendingRequests,
    List<TeamCalendarDto> TeamCalendar
);

public record HRDashboardDto(
    int TotalEmployees, int PendingRequests, int ApprovedThisMonth, int RejectedThisMonth,
    List<DepartmentLeaveStatDto> DepartmentStats,
    List<LeaveRequestDto> AllPendingRequests,
    List<MonthlyLeaveStatDto> MonthlyStats
);

public record TeamCalendarDto(string EmployeeName, DateTime FromDate, DateTime ToDate, string LeaveType, string Status);
public record HolidayDto(string Name, DateTime Date);
public record DepartmentLeaveStatDto(string Department, int TotalRequests, int Approved, int Rejected, int Pending);
public record MonthlyLeaveStatDto(string Month, int Total, int Approved, int Rejected, int Pending);

// Team member with leave info
public record TeamMemberDto(
    int Id, string Name, string Email, string EmployeeCode,
    string Department, DateTime JoiningDate,
    string CurrentStatus,  // OnLeave, Present
    List<LeaveBalanceDto> Balances,
    List<RecentLeaveDto> RecentLeaves
);
public record RecentLeaveDto(string RequestNumber, string LeaveType, DateTime FromDate, DateTime ToDate, decimal TotalDays, string Status);
