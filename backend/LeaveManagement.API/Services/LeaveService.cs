using LeaveManagement.API.Data;
using LeaveManagement.API.DTOs;
using LeaveManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.API.Services;

public interface ILeaveService
{
    Task<(bool Success, string Message, LeaveRequestDto? Data)> ApplyLeave(int userId, ApplyLeaveDto dto);
    Task<LeaveRequestDto?> GetById(int id);
    Task<List<LeaveRequestDto>> GetMyLeaves(int userId);
    Task<List<LeaveRequestDto>> GetPendingForManager(int managerId);
    Task<List<LeaveRequestDto>> GetPendingManagerLeaves();
    Task<List<TeamMemberDto>> GetTeamMembers(int managerId);
    Task<List<LeaveRequestDto>> GetAll();
    Task<(bool Success, string Message)> ActionLeave(int requestId, int actorId, string role, ActionLeaveDto dto);
    Task<List<LeaveBalanceDto>> GetBalances(int userId);
    Task<EmployeeDashboardDto> GetEmployeeDashboard(int userId);
    Task<ManagerDashboardDto> GetManagerDashboard(int managerId);
    Task<HRDashboardDto> GetHRDashboard();
}

public class LeaveService : ILeaveService
{
    private readonly AppDbContext _db;
    public LeaveService(AppDbContext db) => _db = db;

    public async Task<(bool Success, string Message, LeaveRequestDto? Data)> ApplyLeave(int userId, ApplyLeaveDto dto)
    {
        if (dto.FromDate > dto.ToDate)
            return (false, "From date cannot be after To date", null);
        if (dto.FromDate.Date < DateTime.UtcNow.Date)
            return (false, "Cannot apply leave for past dates", null);

        var holidays = await _db.Holidays
            .Where(h => h.Year == dto.FromDate.Year)
            .Select(h => h.Date.Date).ToListAsync();

        decimal workingDays = 0;
        for (var d = dto.FromDate.Date; d <= dto.ToDate.Date; d = d.AddDays(1))
            if (d.DayOfWeek != DayOfWeek.Saturday && d.DayOfWeek != DayOfWeek.Sunday && !holidays.Contains(d))
                workingDays++;

        if (dto.IsHalfDay) workingDays = 0.5m;
        if (workingDays == 0) return (false, "Selected dates fall only on weekends/holidays", null);

        var balance = await _db.LeaveBalances.FirstOrDefaultAsync(b =>
            b.UserId == userId && b.LeaveTypeId == dto.LeaveTypeId && b.Year == DateTime.UtcNow.Year);

        if (balance == null) return (false, "Leave balance not found", null);
        if (balance.AvailableDays < workingDays)
            return (false, $"Insufficient balance. Available: {balance.AvailableDays} days, Requested: {workingDays} days", null);

        var overlap = await _db.LeaveRequests.AnyAsync(l =>
            l.UserId == userId && l.Status != "Cancelled" && l.Status != "Rejected" &&
            l.FromDate <= dto.ToDate && l.ToDate >= dto.FromDate);
        if (overlap) return (false, "You already have a leave overlapping these dates", null);

        var user = await _db.Users.FindAsync(userId);
        var request = new LeaveRequest
        {
            RequestNumber = $"LR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..5].ToUpper()}",
            UserId = userId, LeaveTypeId = dto.LeaveTypeId,
            FromDate = dto.FromDate, ToDate = dto.ToDate,
            TotalDays = workingDays, Reason = dto.Reason,
            IsHalfDay = dto.IsHalfDay, Status = "Pending"
        };
        request.AuditLogs.Add(new LeaveAuditLog { Action = "Applied", PerformedBy = user!.Name, Comment = dto.Reason });
        balance.PendingDays += workingDays;

        _db.LeaveRequests.Add(request);
        await _db.SaveChangesAsync();
        return (true, "Leave applied successfully", await MapToDto(request.Id));
    }

    public async Task<(bool Success, string Message)> ActionLeave(int requestId, int actorId, string role, ActionLeaveDto dto)
    {
        var request = await _db.LeaveRequests.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == requestId);
        if (request == null) return (false, "Leave request not found");

        var actor = await _db.Users.FindAsync(actorId);
        if (actor == null) return (false, "Actor not found");

        var requestingUser = await _db.Users.FindAsync(request.UserId);
        if (requestingUser == null) return (false, "Requesting user not found");

        if (dto.Action == "Cancelled")
        {
            if (request.UserId != actorId && role != "HRAdmin")
                return (false, "You can only cancel your own leave");
            if (request.Status != "Pending")
                return (false, "Only pending leaves can be cancelled");
        }
        else
        {
            if (request.Status != "Pending")
                return (false, "Only pending leaves can be approved or rejected");

            if (requestingUser.Role == "Employee")
            {
                if (role == "Manager")
                {
                    var isReportee = await _db.Users.AnyAsync(u => u.Id == request.UserId && u.ManagerId == actorId);
                    if (!isReportee) return (false, "You can only approve your direct reportees' leaves");
                }
            }
            else if (requestingUser.Role == "Manager")
            {
                if (role != "HRAdmin") return (false, "Only HR Admin can approve a Manager's leave");
            }
            else if (requestingUser.Role == "HRAdmin")
            {
                if (role != "HRAdmin") return (false, "Only HR Admin can approve this leave");
            }
        }

        var balance = await _db.LeaveBalances.FirstOrDefaultAsync(b =>
            b.UserId == request.UserId && b.LeaveTypeId == request.LeaveTypeId && b.Year == DateTime.UtcNow.Year);

        request.Status = dto.Action;
        request.ManagerComment = dto.Comment;
        request.ActionDate = DateTime.UtcNow;

        if (balance != null)
        {
            balance.PendingDays -= request.TotalDays;
            if (dto.Action == "Approved") balance.UsedDays += request.TotalDays;
        }

        if (dto.Action == "Approved" || dto.Action == "Rejected")
            request.ApprovedByManagerId = actorId;

        request.AuditLogs.Add(new LeaveAuditLog { Action = dto.Action, PerformedBy = actor.Name, Comment = dto.Comment });
        await _db.SaveChangesAsync();
        return (true, $"Leave {dto.Action.ToLower()} successfully");
    }

    public async Task<List<LeaveBalanceDto>> GetBalances(int userId) =>
        await _db.LeaveBalances.Include(b => b.LeaveType)
            .Where(b => b.UserId == userId && b.Year == DateTime.UtcNow.Year)
            .Select(b => new LeaveBalanceDto(b.LeaveTypeId, b.LeaveType.Name, b.LeaveType.Code,
                b.TotalDays, b.UsedDays, b.PendingDays, b.AvailableDays))
            .ToListAsync();

    public async Task<List<LeaveRequestDto>> GetMyLeaves(int userId)
    {
        var ids = await _db.LeaveRequests.Where(r => r.UserId == userId)
            .OrderByDescending(r => r.AppliedOn).Select(r => r.Id).ToListAsync();
        var result = new List<LeaveRequestDto>();
        foreach (var id in ids) result.Add((await MapToDto(id))!);
        return result;
    }

    public async Task<List<LeaveRequestDto>> GetPendingForManager(int managerId)
    {
        var reporteeIds = await _db.Users.Where(u => u.ManagerId == managerId).Select(u => u.Id).ToListAsync();
        var ids = await _db.LeaveRequests
            .Where(r => reporteeIds.Contains(r.UserId) && r.Status == "Pending")
            .OrderBy(r => r.AppliedOn).Select(r => r.Id).ToListAsync();
        var result = new List<LeaveRequestDto>();
        foreach (var id in ids) result.Add((await MapToDto(id))!);
        return result;
    }

    public async Task<List<LeaveRequestDto>> GetPendingManagerLeaves()
    {
        var managerIds = await _db.Users.Where(u => u.Role == "Manager").Select(u => u.Id).ToListAsync();
        var ids = await _db.LeaveRequests
            .Where(r => managerIds.Contains(r.UserId) && r.Status == "Pending")
            .OrderBy(r => r.AppliedOn).Select(r => r.Id).ToListAsync();
        var result = new List<LeaveRequestDto>();
        foreach (var id in ids) result.Add((await MapToDto(id))!);
        return result;
    }

    public async Task<List<LeaveRequestDto>> GetAll()
    {
        var ids = await _db.LeaveRequests.OrderByDescending(r => r.AppliedOn).Select(r => r.Id).ToListAsync();
        var result = new List<LeaveRequestDto>();
        foreach (var id in ids) result.Add((await MapToDto(id))!);
        return result;
    }

    public async Task<LeaveRequestDto?> GetById(int id) => await MapToDto(id);

    public async Task<EmployeeDashboardDto> GetEmployeeDashboard(int userId)
    {
        var user = await _db.Users.Include(u => u.Manager).FirstAsync(u => u.Id == userId);
        var balances = await GetBalances(userId);
        var recentIds = await _db.LeaveRequests.Where(r => r.UserId == userId)
            .OrderByDescending(r => r.AppliedOn).Take(5).Select(r => r.Id).ToListAsync();
        var recentRequests = new List<LeaveRequestDto>();
        foreach (var id in recentIds) recentRequests.Add((await MapToDto(id))!);
        var holidays = await _db.Holidays.Where(h => h.Date >= DateTime.UtcNow)
            .OrderBy(h => h.Date).Take(5).Select(h => new HolidayDto(h.Name, h.Date)).ToListAsync();
        return new EmployeeDashboardDto(user.Name, user.Department, user.Manager?.Name ?? "N/A", balances, recentRequests, holidays);
    }

    public async Task<ManagerDashboardDto> GetManagerDashboard(int managerId)
    {
        var reporteeIds = await _db.Users.Where(u => u.ManagerId == managerId).Select(u => u.Id).ToListAsync();
        var pendingCount = await _db.LeaveRequests.CountAsync(r => reporteeIds.Contains(r.UserId) && r.Status == "Pending");
        var pendingRequests = await GetPendingForManager(managerId);
        var teamCalendar = await _db.LeaveRequests.Include(r => r.User).Include(r => r.LeaveType)
            .Where(r => reporteeIds.Contains(r.UserId) && r.Status == "Approved" && r.ToDate >= DateTime.UtcNow)
            .OrderBy(r => r.FromDate)
            .Select(r => new TeamCalendarDto(r.User.Name, r.FromDate, r.ToDate, r.LeaveType.Name, r.Status))
            .ToListAsync();
        return new ManagerDashboardDto(reporteeIds.Count, pendingCount, pendingRequests, teamCalendar);
    }

    public async Task<HRDashboardDto> GetHRDashboard()
    {
        var now = DateTime.UtcNow;
        var totalEmp = await _db.Users.CountAsync(u => u.Role == "Employee" || u.Role == "Manager");
        var pendingCount = await _db.LeaveRequests.CountAsync(r => r.Status == "Pending");
        var approvedThisMonth = await _db.LeaveRequests.CountAsync(r =>
            r.Status == "Approved" && r.ActionDate.HasValue &&
            r.ActionDate.Value.Month == now.Month && r.ActionDate.Value.Year == now.Year);
        var rejectedThisMonth = await _db.LeaveRequests.CountAsync(r =>
            r.Status == "Rejected" && r.ActionDate.HasValue &&
            r.ActionDate.Value.Month == now.Month && r.ActionDate.Value.Year == now.Year);

        var deptStats = await _db.LeaveRequests.Include(r => r.User)
            .GroupBy(r => r.User.Department)
            .Select(g => new DepartmentLeaveStatDto(g.Key, g.Count(),
                g.Count(r => r.Status == "Approved"), g.Count(r => r.Status == "Rejected"),
                g.Count(r => r.Status == "Pending")))
            .ToListAsync();

        // Monthly stats for last 6 months
        var sixMonthsAgo = now.AddMonths(-5);
        var rawMonthly = await _db.LeaveRequests
            .Where(r => r.AppliedOn >= new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1))
            .ToListAsync();

        var monthlyStats = rawMonthly
            .GroupBy(r => new { r.AppliedOn.Year, r.AppliedOn.Month })
            .Select(g => new MonthlyLeaveStatDto(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                g.Count(),
                g.Count(r => r.Status == "Approved"),
                g.Count(r => r.Status == "Rejected"),
                g.Count(r => r.Status == "Pending")))
            .OrderBy(m => m.Month)
            .ToList();

        var allPending = await GetAll();
        return new HRDashboardDto(totalEmp, pendingCount, approvedThisMonth, rejectedThisMonth,
            deptStats, allPending.Where(r => r.Status == "Pending").ToList(), monthlyStats);
    }

    public async Task<List<TeamMemberDto>> GetTeamMembers(int managerId)
    {
        var reportees = await _db.Users
            .Where(u => u.ManagerId == managerId && u.IsActive)
            .ToListAsync();

        var result = new List<TeamMemberDto>();
        var today = DateTime.UtcNow.Date;

        foreach (var emp in reportees)
        {
            // Get leave balances
            var balances = await _db.LeaveBalances
                .Include(b => b.LeaveType)
                .Where(b => b.UserId == emp.Id && b.Year == today.Year)
                .Select(b => new LeaveBalanceDto(
                    b.LeaveTypeId, b.LeaveType.Name, b.LeaveType.Code,
                    b.TotalDays, b.UsedDays, b.PendingDays, b.AvailableDays))
                .ToListAsync();

            // Check if currently on approved leave today
            var isOnLeave = await _db.LeaveRequests.AnyAsync(l =>
                l.UserId == emp.Id &&
                l.Status == "Approved" &&
                l.FromDate.Date <= today &&
                l.ToDate.Date >= today);

            // Get last 3 leave requests
            var recentLeaves = await _db.LeaveRequests
                .Include(l => l.LeaveType)
                .Where(l => l.UserId == emp.Id)
                .OrderByDescending(l => l.AppliedOn)
                .Take(3)
                .Select(l => new RecentLeaveDto(
                    l.RequestNumber, l.LeaveType.Name,
                    l.FromDate, l.ToDate, l.TotalDays, l.Status))
                .ToListAsync();

            result.Add(new TeamMemberDto(
                emp.Id, emp.Name, emp.Email, emp.EmployeeCode,
                emp.Department, emp.JoiningDate,
                isOnLeave ? "On Leave" : "Present",
                balances, recentLeaves));
        }

        return result;
    }

    private async Task<LeaveRequestDto?> MapToDto(int id)
    {
        var r = await _db.LeaveRequests
            .Include(x => x.User).Include(x => x.LeaveType)
            .Include(x => x.ApprovedByManager).Include(x => x.AuditLogs)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (r == null) return null;
        return new LeaveRequestDto(
            r.Id, r.RequestNumber, r.User.Name, r.User.EmployeeCode,
            r.User.Department, r.LeaveType.Name, r.LeaveType.Code,
            r.FromDate, r.ToDate, r.TotalDays, r.Reason, r.Status,
            r.ManagerComment, r.ApprovedByManager?.Name, r.ActionDate, r.AppliedOn,
            r.IsHalfDay,
            r.AuditLogs.OrderBy(a => a.Timestamp)
                .Select(a => new AuditLogDto(a.Action, a.PerformedBy, a.Comment, a.Timestamp)).ToList());
    }
}
